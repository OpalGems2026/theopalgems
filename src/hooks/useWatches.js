import { useEffect, useState } from 'react';
import staticWatches from '../data/watches.js';
import { getPublicWatches } from '../lib/publicData.js';

/**
 * The public watch catalogue, live from Supabase with the bundled file as a seed.
 *
 * Why it works this way:
 *  - `src/data/watches.js` is the seed. It renders instantly, it is what the
 *    prerenderer bakes into the static HTML for SEO, and it is what visitors
 *    see if Supabase is slow or unreachable.
 *  - Supabase is the source of truth once it answers, so a price edited in
 *    /admin/watches actually reaches the website. Before this hook existed the
 *    public pages read the bundled file only, so admin edits never appeared.
 *
 * The live result is only accepted when it is a non-empty array, so an empty
 * table or a failed request can never blank the catalogue — it just leaves the
 * seed in place.
 */
export function useWatches() {
  const [watches, setWatches] = useState(staticWatches);

  useEffect(() => {
    let cancelled = false;
    getPublicWatches()
      .then((rows) => {
        if (!cancelled && Array.isArray(rows) && rows.length) setWatches(rows);
      })
      .catch((err) => {
        // Non-fatal: the seed is already on screen.
        console.warn('useWatches: falling back to bundled catalogue —', err?.message || err);
      });
    return () => { cancelled = true; };
  }, []);

  return watches;
}

export default useWatches;
