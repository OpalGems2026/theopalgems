/**
 * Single source of truth for rendering a price in the UI.
 *
 * Prices reach the UI in two shapes and always have:
 *   - jewellery (kira/jupiter/opalGrand/opalSol/curated) stores a NUMBER, e.g. 2375
 *   - watches (src/data/watches.js) stores a STRING, e.g. "$73,400"
 *
 * Renderers that did `Number(price)` worked for the first and produced "$NaN"
 * for the second, which is why a watch's price on the grid did not match the
 * price in its modal. Everything that displays a price must use this helper.
 *
 * @param {number|string|null|undefined} value
 * @returns {string|null} e.g. "$73,400" — or null when there is no usable price
 */
export function formatPrice(value) {
  if (value == null || value === '') return null;

  // Keep digits and decimal points only, so "$73,400" and 73400 both parse.
  const cleaned = typeof value === 'number' ? String(value) : String(value).replace(/[^0-9.]/g, '');
  if (!/\d/.test(cleaned)) return null; // e.g. "Price on request"

  const n = Number(cleaned);
  if (!Number.isFinite(n)) return null; // e.g. "1.234.567" — better blank than wrong

  const hasCents = Math.round(n * 100) % 100 !== 0;
  return `$${n.toLocaleString('en-US', {
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
}

/** Numeric value of a price, for sorting and range filters. Null when unusable. */
export function priceValue(value) {
  if (value == null || value === '') return null;
  const cleaned = typeof value === 'number' ? String(value) : String(value).replace(/[^0-9.]/g, '');
  const n = Number(cleaned);
  return !Number.isFinite(n) || n === 0 ? null : n;
}

/**
 * Shared catalogue price bands. Defined here, not per page — the category and
 * location pages drifted apart twice by each keeping their own copy of this
 * kind of logic, so both now import from one place.
 */
export const PRICE_RANGES = [
  { key: 'all', label: 'All Prices' },
  { key: 'u2', label: 'Under $2,000', min: 0, max: 2000 },
  { key: '2-4', label: '$2,000–$4,000', min: 2000, max: 4000 },
  { key: '4-7', label: '$4,000–$7,000', min: 4000, max: 7000 },
  { key: '7+', label: '$7,000+', min: 7000, max: Infinity },
];

/**
 * Apply a price band and a sort order to a list of catalogue items.
 * Items with no usable price sort last ascending and first descending, so an
 * unpriced piece never leads the grid.
 *
 * @param {Array}  items
 * @param {string} rangeKey  a PRICE_RANGES key
 * @param {string} sortOrder 'featured' | 'price-asc' | 'price-desc'
 */
export function applyPriceControls(items, rangeKey, sortOrder) {
  const range = PRICE_RANGES.find((r) => r.key === rangeKey) || PRICE_RANGES[0];
  const ranged = range.key === 'all'
    ? items
    : items.filter((p) => {
        const v = priceValue(p.price);
        return v != null && v >= range.min && v < range.max;
      });
  if (sortOrder !== 'price-asc' && sortOrder !== 'price-desc') return ranged;
  return [...ranged].sort((a, b) => {
    const av = priceValue(a.price) ?? (sortOrder === 'price-asc' ? Infinity : -Infinity);
    const bv = priceValue(b.price) ?? (sortOrder === 'price-asc' ? Infinity : -Infinity);
    return sortOrder === 'price-asc' ? av - bv : bv - av;
  });
}

export default formatPrice;
