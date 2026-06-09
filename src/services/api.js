import { mockGetStores, mockSearchProducts } from './mockData';

export const CHAINS = {
  silpo: { name: 'Сільпо', color: '#FF8521', bg: '#fff8f2', hub: 'silpo' },
  atb:   { name: 'АТБ',    color: '#EF3E33', bg: '#fff5f5', hub: 'atbmarket' },
  metro: { name: 'METRO',  color: '#003082', bg: '#f0f4ff', hub: 'metro' },
};

export async function getStores(hub) {
  const chainKey = Object.keys(CHAINS).find((k) => CHAINS[k].hub === hub);
  return mockGetStores(chainKey);
}

export async function searchProducts(storeId, query, chainKey) {
  return mockSearchProducts(storeId, chainKey, query);
}
