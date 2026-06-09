import ShopColumn from './ShopColumn';

export default function ResultsGrid({ shops, results }) {
  return (
    <div className="results-grid">
      {shops.map((shop) => (
        <ShopColumn key={shop.id} shop={shop} result={results[shop.id]} />
      ))}
    </div>
  );
}
