import ShopColumn from './ShopColumn';

export default function ResultsGrid({ shops, results, onCardClick }) {
  return (
    <div className="results-grid">
      {shops.map((shop) => (
        <ShopColumn key={shop.id} shop={shop} result={results[shop.id]} onCardClick={onCardClick} />
      ))}
    </div>
  );
}
