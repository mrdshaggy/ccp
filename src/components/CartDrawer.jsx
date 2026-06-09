import { CHAINS } from '../services/api';

export default function CartDrawer({ cart, onRemoveItem, onClose }) {
  const shopEntries = Object.entries(cart).filter(([, s]) => s.items.length > 0);
  const totalItems = shopEntries.reduce((sum, [, s]) => sum + s.items.length, 0);
  const grandTotal = shopEntries.reduce(
    (sum, [, s]) => sum + s.items.reduce((ss, p) => ss + Number(p.price || 0), 0),
    0
  );

  return (
    <div className="cart-overlay" onClick={onClose}>
      <div className="cart-drawer" onClick={e => e.stopPropagation()}>
        <div className="cart-header">
          <div className="cart-title">
            Кошик {totalItems > 0 && <span className="cart-count-badge">{totalItems}</span>}
          </div>
          <div className="cart-header-actions">
            {shopEntries.length > 0 && (
              <button className="cart-print-btn" onClick={() => window.print()}>
                Друк / PDF
              </button>
            )}
            <button className="modal-close" onClick={onClose}>✕</button>
          </div>
        </div>

        <div className="cart-body">
          {shopEntries.length === 0 && (
            <div className="cart-empty">
              <div className="empty-icon">🛒</div>
              <p>Кошик порожній</p>
              <p className="cart-empty-hint">Натисніть на товар у результатах пошуку, щоб порівняти та додати до кошика</p>
            </div>
          )}

          {shopEntries.map(([shopId, { shop, chainKey, items }]) => {
            const chain = CHAINS[chainKey];
            const shopTotal = items.reduce((s, p) => s + Number(p.price || 0), 0);
            return (
              <div key={shopId} className="cart-shop-section">
                <div className="cart-shop-header" style={{ '--c': chain.color, '--bg': chain.bg }}>
                  <span className="cart-shop-chain">{chain.name}</span>
                  <span className="cart-shop-name">{shop.title}</span>
                </div>
                <div className="cart-items">
                  {items.map((product, idx) => (
                    <div key={product.ean || idx} className="cart-item">
                      <div className="cart-item-info">
                        <div className="cart-item-name">{product.title}</div>
                        {product.weight && <div className="cart-item-weight">{product.weight}</div>}
                      </div>
                      <div className="cart-item-right">
                        <span className="cart-item-price" style={{ color: chain.color }}>
                          {Number(product.price).toFixed(2)} грн
                        </span>
                        <button
                          className="cart-item-remove"
                          onClick={() => onRemoveItem(shopId, product.ean)}
                          aria-label="Видалити"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="cart-shop-total" style={{ color: chain.color }}>
                  Разом: {shopTotal.toFixed(2)} грн
                </div>
              </div>
            );
          })}

          {shopEntries.length > 0 && (
            <div className="cart-grand-total">
              Загальна сума: <strong>{grandTotal.toFixed(2)} грн</strong>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
