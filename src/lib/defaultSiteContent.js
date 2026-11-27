/**
 * Default site content.
 *
 * Single source of truth for the homepage `sections` table shape. Both the
 * admin editor (`src/admin/AdminSections.jsx`) and the public site
 * (`App.jsx`, `CategoryPage.jsx`, etc.) read from this file so they never
 * drift apart.
 *
 * When the `sections` table is empty (or a particular key is missing), the
 * public site falls back to these values. Admin edits are merged on top.
 *
 * Keep this file *content-only* — no React, no DOM, so it can be imported
 * from both the public bundle and the admin bundle without bloating either.
 */

export const defaultSections = {
  // ── Homepage hero (2026-11 redesign) ──
  // A NEW key rather than `hero`: the live `sections` table holds an old `hero`
  // row that would override these values. Using a fresh key lets the redesign
  // render exactly as specified, and Admin → Homepage → Hero edits this block.
  homeHero: {
    title: 'A Different Kind of Brilliance',
    subtitle: 'Fine jewelry, thoughtfully curated for wherever life takes you.',
    ctaText: 'Explore the Collection',
    ctaUrl: '#categories',
    image: '/assets/home-2026/hero.jpg',
    imageAlt: 'Model wearing an Opal Gems diamond necklace, earrings and ring',
  },

  // ── Full-width editorial collage (3 photos, no text) ──
  collage: {
    images: [
      { src: '/assets/home-2026/collage-1.jpg', alt: 'Diamond tennis necklace worn at the collarbone' },
      { src: '/assets/home-2026/collage-2.jpg', alt: 'Model in black wearing Opal Gems diamonds' },
      { src: '/assets/home-2026/collage-3.jpg', alt: 'Solitaire diamond engagement ring' },
    ],
  },

  // ── Legacy hero (pre-2026-11). No longer rendered on the homepage; kept so
  // older admin saves and the `sections` row still parse. ──
  hero: {
    eyebrow: 'Step Into The Opal Experience',
    title: 'Welcome to the World of Opal Gems',
    tagline: 'Elevated Diamonds, In Person',
    ctaText: 'Shop Now',
    ctaUrl: '#categories',
    secondaryCtaText: 'Visit a Boutique',
    secondaryCtaUrl: '#locations',
    images: [
      '/assets/homepage-inspiration/WhatsApp Image 2026-04-17 at 11.01.33.jpeg',
      '/assets/homepage-inspiration/stacked2.jpeg',
      '/assets/homepage-inspiration/WhatsApp Image 2026-04-17 at 11.01.33 (1).jpeg',
    ],
    // Legacy single-image field kept so older admin saves still work.
    image: '/assets/boutique-mood-lifestyle.jpg',
  },

  // ── About strip (homepage section) ──
  about: {
    title: 'A Family Legacy of Fine Jewelry',
    description:
      'With over 30 years of expertise, Opal Gems brings you hand-selected diamonds and bespoke jewelry in the most exclusive resort settings in Florida.',
    ownerImage: '/assets/michelle_and_gill.jfif',
    ownerNames: 'Michelle & Gil',
    ownerTitle: 'Founders of Opal Gems',
  },

  // ── Image grid (5 category tiles) ──
  imageGrid: {
    topLeft: { src: '/assets/homepage-inspiration/lose.jpeg', alt: 'Diamond jewelry' },
    topRight: { src: '/assets/homepage-inspiration/stacked.jpeg', alt: 'Stacked jewelry' },
    // Order matches the client's brief: Necklaces, Earrings, Bracelets, Rings, Watches.
    bottom: [
      { key: 'necklaces', label: 'Necklaces', image: '/assets/home-2026/cat-necklaces.jpg' },
      { key: 'earrings', label: 'Earrings', image: '/assets/home-2026/cat-earrings.jpg' },
      { key: 'bracelets', label: 'Bracelets', image: '/assets/home-2026/cat-bracelets.jpg' },
      { key: 'rings', label: 'Rings', image: '/assets/home-2026/cat-rings.jpg' },
      { key: 'watches', label: 'Watches', image: '/assets/home-2026/cat-watches.jpg' },
    ],
  },

  // ── Split section: image one side, copy the other ──
  // (Key kept as `crafted` so the existing admin tab still edits it;
  // only `imageLeft` is used since the 2026-11 redesign.)
  crafted: {
    title: 'The Art of Everyday Luxury',
    subtitle: 'Exceptional pieces, made to be worn your way.',
    ctaText: 'Explore the Collection',
    ctaUrl: '#categories',
    imageLeft: '/assets/home-2026/everyday.jpg',
    imageRight: '',
  },

  // ── Hotel partnership: lifestyle image + copy ──
  partnership: {
    eyebrow: '',
    title: 'A Little Luxury, Wherever You Stay',
    body:
      'Discover Opal Gems at select Opal Collection destinations. An elevated jewelry experience, thoughtfully curated for your time away.',
    image: '/assets/home-2026/hotel-hd.jpg',
    imageAlt: 'Guest arriving in the lobby of an Opal Collection hotel',
  },

  // ── Continuous auto-scrolling photo strip (5 photos) ──
  carousel: {
    images: [
      { src: '/assets/home-2026/strip-1.jpg', alt: 'Diamond necklace and bracelet in a floral dress' },
      { src: '/assets/home-2026/strip-2.jpg', alt: 'Diamond hoop earring' },
      { src: '/assets/home-2026/strip-3.jpg', alt: 'Diamond necklace, ring and tennis bracelet' },
      { src: '/assets/home-2026/strip-4.jpg', alt: 'Stacked diamond tennis bracelets' },
      { src: '/assets/home-2026/strip-5.jpg', alt: 'Model on a staircase wearing Opal Gems' },
    ],
  },

  // ── Testimonials section ──
  testimonialsHeader: {
    eyebrow: 'In Their Own Words',
    title: 'A Lasting Impression',
    subtitle: 'The little moments that make Opal Gems special.',
  },
  testimonials: [
    { id: 't1', name: 'Sarah M.', location: 'Delray Beach', text: 'The personal attention was incredible. They helped me find the perfect anniversary gift.', rating: 5 },
    { id: 't2', name: 'James R.', location: 'Jupiter', text: 'Outstanding selection and knowledgeable staff. A true luxury experience.', rating: 5 },
    { id: 't3', name: 'Elena K.', location: 'Clearwater', text: 'I fell in love with their collection. The quality is unmatched.', rating: 5 },
  ],
  reviews: {
    score: '4.9',
    count: 'Based on 127 reviews',
  },

  // ── Locations header (cards themselves come from `locations` table) ──
  locationsHeader: {
    eyebrow: 'Locations',
    title: 'Our Boutiques',
    subtitle: 'Discover Opal Gems in person at select destinations across Florida.',
  },

  // ── Legacy "categories" row on homepage (kept for AdminSections compat) ──
  categories: [
    { name: 'Necklaces', image: '/assets/category-necklaces.PNG' },
    { name: 'Rings', image: '/assets/category-rings.PNG' },
    { name: 'Earrings', image: '/assets/category-earrings.PNG' },
    { name: 'Bracelets', image: '/assets/category-bracelets.PNG' },
    { name: 'Watches', image: '/assets/category-watches.PNG' },
  ],

  // ── Showcase strip (legacy, replaced by `photos` table where section='showcase') ──
  showcase: [
    { id: 's1', image: '/assets/four_piece_daimonds.PNG', alt: 'Diamond jewelry set' },
    { id: 's2', image: '/assets/Stacked_diamond_eternity_bands.PNG', alt: 'Stacked diamond eternity bands' },
    { id: 's3', image: '/assets/diamonds_loose.PNG', alt: 'Loose diamonds' },
    { id: 's4', image: '/assets/Diamond_necklace.PNG', alt: 'Diamond necklace' },
    { id: 's5', image: '/assets/diamond_rings_on_the_beach.PNG', alt: 'Diamond rings' },
    { id: 's6', image: '/assets/daimond_strands.PNG', alt: 'Diamond strands' },
  ],

  // ── Per-category page hero (drives /category/:slug) ──
  categoryPages: {
    necklaces: {
      title: 'Necklaces',
      description: 'From delicate pendants to statement tennis necklaces, discover pieces that elevate every neckline.',
      image: '/assets/category-necklaces.PNG',
    },
    rings: {
      title: 'Rings',
      description: 'Engagement rings, stackable bands, and cocktail rings crafted with exceptional diamonds.',
      image: '/assets/Stacked_diamond_eternity_bands.PNG',
    },
    earrings: {
      title: 'Earrings',
      description: 'Studs, hoops, and drop earrings designed to catch the light and turn heads.',
      image: '/assets/category-earrings.PNG',
    },
    bracelets: {
      title: 'Bracelets',
      description: 'Tennis bracelets, bangles, and chain bracelets that add sparkle to every gesture.',
      image: '/assets/category-bracelets.PNG',
    },
    watches: {
      title: 'Watches',
      description: 'Luxury timepieces that blend precision craftsmanship with timeless elegance.',
      image: '/assets/watch_category.PNG',
    },
  },

  // ── Watch brand filter on /category/watches ──
  watchBrands: ['All', 'Rolex', 'Audemars Piguet', 'Cartier', 'Patek Philippe'],
};

/**
 * Merge a partial overrides object (e.g. what came back from Supabase) on
 * top of the defaults. One-level deep for object values; arrays replace.
 * Missing keys fall back to the default.
 */
export function mergeSections(overrides) {
  const merged = { ...defaultSections };
  if (!overrides || typeof overrides !== 'object') return merged;
  for (const [key, value] of Object.entries(overrides)) {
    if (value == null) continue;
    if (
      typeof value === 'object' &&
      !Array.isArray(value) &&
      typeof merged[key] === 'object' &&
      !Array.isArray(merged[key])
    ) {
      merged[key] = { ...merged[key], ...value };
    } else {
      merged[key] = value;
    }
  }
  return merged;
}
