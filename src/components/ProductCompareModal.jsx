import { useEffect, useState } from 'react';
import { searchProducts, CHAINS } from '../services/api';
import ProductCard from './ProductCard';

function findBestMatch(items, targetTitle) {
  if (!items.length) return null;
  const targetWords = targetTitle.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  const targetSet = new Set(targetWords);
  let best = null, bestScore = -1;
  for (const item of items) {
    const itemWords = item.title.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    const overlap = itemWords.filter(w => targetSet.has(w)).length;
    const score = targetWords.length > 0 ? overlap / targetWords.length : 0;
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
      searchProducts(shopEntry.store, sourceProduct.title, shopEntry.chainKey)
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
