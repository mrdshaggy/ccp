import { useState } from 'react';

export default function SearchBar({ onSearch, disabled }) {
  const [query, setQuery] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    const q = query.trim();
    if (q) onSearch(q);
  }

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <div className="search-input-wrap">
        <svg className="search-icon" viewBox="0 0 20 20" fill="none">
          <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.8"/>
          <path d="M13 13l4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
        <input
          className="search-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={disabled ? 'Спочатку додайте магазин…' : 'Пошук товарів (напр. "молоко", "хліб")…'}
          disabled={disabled}
        />
        {query && (
          <button type="button" className="search-clear" onClick={() => setQuery('')}>✕</button>
        )}
      </div>
      <button className="search-btn" type="submit" disabled={disabled || !query.trim()}>
        Знайти
      </button>
    </form>
  );
}
