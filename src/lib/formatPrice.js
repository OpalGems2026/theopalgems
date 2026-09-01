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

export default formatPrice;
