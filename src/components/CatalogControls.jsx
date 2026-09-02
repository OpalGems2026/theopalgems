import React from 'react';
import { PRICE_RANGES } from '../lib/formatPrice';

/**
 * Price band buttons + sort dropdown, shared by the category and location pages.
 *
 * Kept as one component on purpose: these two pages have twice drifted apart by
 * each holding its own copy of the same UI, so the controls, the bands and the
 * filtering logic (lib/formatPrice.js applyPriceControls) now live in one place.
 */
export default function CatalogControls({ priceRange, onPriceRange, sortOrder, onSortOrder }) {
  return (
    <div className="catalog-controls">
      <div className="catalog-controls__filters">
        {PRICE_RANGES.map((r) => (
          <button
            key={r.key}
            type="button"
            className={`pill small ${priceRange === r.key ? 'primary' : 'ghost'}`}
            aria-pressed={priceRange === r.key}
            onClick={() => onPriceRange(r.key)}
          >
            {r.label}
          </button>
        ))}
      </div>
      <label className="catalog-controls__sort">
        <span>Sort</span>
        <select value={sortOrder} onChange={(e) => onSortOrder(e.target.value)}>
          <option value="featured">Featured</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
        </select>
      </label>
    </div>
  );
}
