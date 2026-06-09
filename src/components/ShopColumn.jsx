import ProductCard from './ProductCard';
import { CHAINS } from '../services/api';

export default function ShopColumn({ shop, result, onCardClick }) {
  const chain = CHAINS[shop.chainKey];
  const { loading, products, error } = result;

  return (
    <div className="shop-column">
      <div className="column-header" style={{ '--c': chain.color, '--bg': chain.bg }}>
        <div className="column-chain">{chain.name}</div>
        <div className="column-store">{shop.store.title}</div>
        {shop.store.address && (
          <div className="column-address">{shop.store.address}</div>
        )}
      </div>

      <div className="column-body">
        {loading && (
          <div className="column-status">
            <div className="spinner" style={{ borderTopColor: chain.color }} />
            <span>Пошук…</span>
          </div>
        )}

        {error && (
          <div className="column-status column-error">
            <span>⚠ {error}</span>
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="column-status column-empty">Нічого не знайдено</div>
        )}

        {!loading && !error && products.map((p, i) => (
          <ProductCard
            key={p.ean || i}
            product={p}
            color={chain.color}
            onClick={onCardClick ? () => onCardClick(p, shop) : undefined}
          />
        ))}
      </div>
    </div>
  );
}
