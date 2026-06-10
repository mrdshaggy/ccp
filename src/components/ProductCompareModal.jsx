import { useEffect, useState } from 'react';
import { searchProducts, CHAINS } from '../services/api';
import ProductCard from './ProductCard';

function stripDecorations(w) {
  return w.replace(/[«»"'()[\],.!?:;]/g, '');
}

function tokenize(title) {
  return (title || '').toLowerCase().split(/\s+/).map(stripDecorations).filter(w => w.length > 2);
}

// Words starting with an uppercase letter — typically brand names / proper nouns
function extractCapitalized(title) {
  return title
    .replace(/[«»"'()[\]]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && /^[А-ЯҐЄІЇЁA-Z]/.test(w))
    .map(w => w.toLowerCase().replace(/[,.!?:;]/g, ''));
}

// Parse fat/concentration percentage: "1,6%", "2.5%", "72%"
function parsePercent(title) {
  const m = title.match(/(\d+[,.]?\d*)\s*%/);
  return m ? parseFloat(m[1].replace(',', '.')) : null;
}

// Parse weight/volume, normalize everything to grams (1кг=1000г, 1л≈1000г, 1мл≈1г)
function parseWeightGrams(title) {
  let m;
  m = title.match(/(\d+[,.]?\d*)\s*кг/i);
  if (m) return Math.round(parseFloat(m[1].replace(',', '.')) * 1000);
  m = title.match(/(\d+[,.]?\d*)\s*мл/i);
  if (m) return Math.round(parseFloat(m[1].replace(',', '.')));
  // л — but not "ли", "ль", "лу" etc. (Cyrillic letters after л)
  m = title.match(/(\d+[,.]?\d*)\s*л(?![а-яіїєґёa-z])/i);
  if (m) return Math.round(parseFloat(m[1].replace(',', '.')) * 1000);
  // г — but not "гр", "га" etc.
  m = title.match(/(\d+[,.]?\d*)\s*г(?![а-яіїєґёa-z])/i);
  if (m) return Math.round(parseFloat(m[1].replace(',', '.')));
  return null;
}

// Use the first 1-2 capitalized words (brand/product-type) as the cross-chain search query.
// A short, focused query is more reliable across APIs than a long phrase.
function makeCompareQuery(title) {
  const caps = title
    .replace(/[«»"'()[\]]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && /^[А-ЯҐЄІЇЁA-Z]/.test(w))
    .map(w => w.replace(/[,.!?:;]/g, ''));
  if (caps.length >= 1) return caps.slice(0, 2).join(' ');
  // fallback: strip numbers/units, keep first 3 words
  return title
    .replace(/[«»"'()[\]]/g, ' ')
    .replace(/\b\d+[,.]?\d*\s*(г|кг|мл|л|шт|%)/gi, ' ')
    .replace(/\b\d+\b/g, ' ')
    .replace(/\s+/g, ' ').trim()
    .split(' ').filter(w => w.length > 2).slice(0, 3).join(' ')
    || title.split(' ').slice(0, 2).join(' ');
}

function findBestMatch(items, targetTitle) {
  const valid = items.filter(item => item.title && item.price != null);
  if (!valid.length) return null;

  const targetCaps = extractCapitalized(targetTitle);
  const targetCapsSet = new Set(targetCaps);
  // Require 2 capitalized-word matches if source has 2+, 1 if source has 1, 0 if none
  const capRequired = Math.min(targetCaps.length, 2);

  const targetPct = parsePercent(targetTitle);
  const targetWeight = parseWeightGrams(targetTitle);

  const candidates = valid.filter(item => {
    // 1. Name: capitalized-word threshold
    if (capRequired > 0) {
      const itemCaps = extractCapitalized(item.title);
      const capMatches = itemCaps.filter(w => targetCapsSet.has(w)).length;
      if (capMatches < capRequired) return false;
    }
    // 2. Fat/concentration %: if both have it, must match
    const itemPct = parsePercent(item.title);
    if (targetPct !== null && itemPct !== null && Math.abs(targetPct - itemPct) > 0.05) return false;
    // 3. Weight: if both have it, must match within 10g
    const itemWeight = parseWeightGrams(item.title);
    if (targetWeight !== null && itemWeight !== null && Math.abs(targetWeight - itemWeight) > 10) return false;
    return true;
  });

  if (!candidates.length) return null;

  // Pick the highest word-overlap candidate
  const targetTokens = tokenize(targetTitle);
  const targetSet = new Set(targetTokens);
  let best = null, bestScore = -1;
  for (const item of candidates) {
    const itemTokens = tokenize(item.title);
    const overlap = itemTokens.filter(w => targetSet.has(w)).length;
    const score = targetSet.size > 0 ? overlap / targetSet.size : 0;
    if (score > bestScore) { bestScore = score; best = item; }
  }
  return best;
}

export default function ProductCompareModal({ sourceProduct, sourceShopId, selectedShops, onAddToCart, onClose }) {
  const [comparisons, setComparisons] = useState(
    selectedShops.map(s => ({
      shopEntry: s,
      loading: s.id !== sourceShopId,
      product: s.id === sourceShopId ? sourceProduct : null,
      error: null,
    }))
  );
  const [added, setAdded] = useState(new Set());

  useEffect(() => {
    selectedShops.forEach((shopEntry, idx) => {
      if (shopEntry.id === sourceShopId) return;
      const searchQuery = makeCompareQuery(sourceProduct.title);
      searchProducts(shopEntry.store, searchQuery, shopEntry.chainKey)
        .then(items => {
          const match = findBestMatch(items, sourceProduct.title);
          setComparisons(prev => prev.map((c, i) => i === idx ? { ...c, loading: false, product: match } : c));
        })
        .catch(err => {
          setComparisons(prev => prev.map((c, i) => i === idx ? { ...c, loading: false, error: err.message } : c));
        });
    });
  }, []);

  const prices = comparisons.filter(c => c.product?.price != null).map(c => Number(c.product.price));
  const minPrice = prices.length > 1 ? Math.min(...prices) : null;

  function handleAdd(shopEntry, product) {
    onAddToCart(shopEntry, product);
    setAdded(prev => new Set([...prev, shopEntry.id]));
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal compare-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Порівняння</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="compare-product-name">{sourceProduct.title}</div>
        <div className="compare-grid">
          {comparisons.map(({ shopEntry, loading, product, error }) => {
            const chain = CHAINS[shopEntry.chainKey];
            const isCheapest = product?.price != null && minPrice != null && Number(product.price) === minPrice;
            const isAdded = added.has(shopEntry.id);
            return (
              <div key={shopEntry.id} className="compare-col">
                <div className="compare-col-header" style={{ '--c': chain.color, '--bg': chain.bg }}>
                  <div className="column-chain">{chain.name}</div>
                  <div className="column-store">{shopEntry.store.title}</div>
                </div>
                <div className="compare-col-body">
                  {loading && (
                    <div className="column-status">
                      <div className="spinner" style={{ borderTopColor: chain.color }} />
                    </div>
                  )}
                  {error && <div className="column-status column-error">⚠ {error}</div>}
                  {!loading && !error && !product && (
                    <div className="column-status column-empty">Не знайдено</div>
                  )}
                  {!loading && !error && product && (
                    <div className="compare-product-wrap">
                      <ProductCard product={product} color={chain.color} isCheapest={isCheapest} />
                      <button
                        className={`compare-add-btn${isAdded ? ' compare-add-btn--added' : ''}`}
                        style={isAdded ? {} : { '--c': chain.color }}
                        onClick={() => !isAdded && handleAdd(shopEntry, product)}
                        disabled={isAdded}
                      >
                        {isAdded ? '✓ В кошику' : '+ До кошика'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
