import { mockGetStores, mockSearchProducts } from './mockData';

export const CHAINS = {
  silpo: { name: 'Сільпо', color: '#FF8521', bg: '#fff8f2', hub: 'silpo' },
  atb:   { name: 'АТБ',    color: '#EF3E33', bg: '#fff5f5', hub: 'atbmarket' },
  metro: { name: 'METRO',  color: '#003082', bg: '#f0f4ff', hub: 'metro' },
};

async function getSilpoStores() {
  const res = await fetch('/silpo-branches/v1/uk/branches', {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return (data.items ?? [])
    .filter((b) => b.hasPickup === true && b.addressFull && b.latitude && b.longitude)
    .map((b) => ({
      id: b.branchId,
      externalId: b.externalId,
      title: `Сільпо ${b.addressFull}`,
      address: `${b.addressFull}, ${b.cityFull}`,
      coordinates: { latitude: parseFloat(b.latitude), longitude: parseFloat(b.longitude) },
    }));
}

function makeTimeslot() {
  const now = new Date();
  now.setMinutes(0, 0, 0);
  const start = now.toISOString().replace('.000', '');
  const end = new Date(now.getTime() + 3600_000).toISOString().replace('.000', '');
  return { start, end };
}

async function fetchEcomProducts(branchId, searchTerm, timeslot) {
  const params = new URLSearchParams({
    limit: '96',
    offset: '0',
    search: searchTerm,
    timeslotStart: timeslot.start,
    timeslotEnd: timeslot.end,
  });
  const res = await fetch(`/silpo-branches/v1/uk/branches/${branchId}/products?${params}`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function searchSilpoProducts(branchId, externalId, query) {
  const timeslot = makeTimeslot();
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);

  const [primaryRes, oldRes] = await Promise.allSettled([
    fetchEcomProducts(branchId, query, timeslot),
    fetch('/silpo-api/api/2.0/exec/EcomCatalogGlobal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method: 'GetSimpleCatalogItems',
        data: { customFilter: query, filialId: String(externalId), skuPerPage: 48, pageNumber: 1 },
      }),
    }).then((r) => (r.ok ? r.json() : null)),
  ]);

  if (primaryRes.status === 'rejected') throw primaryRes.reason;
  let items = primaryRes.value.items ?? [];

  // Multi-word query with no results: search each word separately, intersect client-side
  if (items.length === 0 && words.length > 1) {
    const wordResults = await Promise.allSettled(
      words.map((w) => fetchEcomProducts(branchId, w, timeslot).then((d) => d.items ?? []))
    );
    const sets = wordResults
      .filter((r) => r.status === 'fulfilled')
      .map((r) => new Map(r.value.map((i) => [i.id, i])));

    if (sets.length > 0) {
      // Keep items that appear in ALL per-word result sets (strict AND intersection)
      const [first, ...rest] = sets;
      items = [...first.values()].filter((item) =>
        rest.every((s) => s.has(item.id))
      );
    }
  }

  const imageMap = {};
  if (oldRes.status === 'fulfilled' && oldRes.value?.items) {
    for (const item of oldRes.value.items) {
      if (item.id && item.mainImage) imageMap[String(item.id)] = item.mainImage;
    }
  }

  return items.map((item) => ({
    ean: String(item.externalProductId ?? item.id),
    title: item.title,
    weight: item.displayRatio ?? item.ratio ?? null,
    img: imageMap[String(item.externalProductId)] ?? null,
    price: item.displayPrice ?? item.price,
    oldPrice: item.displayOldPrice ?? item.oldPrice ?? null,
  }));
}

export async function getStores(hub) {
  if (hub === 'silpo') return getSilpoStores();
  const chainKey = Object.keys(CHAINS).find((k) => CHAINS[k].hub === hub);
  return mockGetStores(chainKey);
}

export async function searchProducts(store, query, chainKey) {
  if (chainKey === 'silpo') return searchSilpoProducts(store.id, store.externalId, query);
  return mockSearchProducts(store.id, chainKey, query);
}
