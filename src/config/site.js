/**
 * Global, brand-level configuration. Anything a deployment might want to
 * change (name, currency, regions, storage namespace) lives here.
 */
export const SITE = {
  name: 'Zruky',
  tagline: 'From hand to hand',
  supportEmail: 'help@zruky.app',
  supportPhone: '+380 44 000 12 34',
  country: 'Ukraine',
};

export const CURRENCY = {
  code: 'UAH',
  symbol: '₴',
  locale: 'en-US',
};

export const LOCATIONS = [
  'Kyiv',
  'Lviv',
  'Odesa',
  'Kharkiv',
  'Dnipro',
  'Zaporizhzhia',
  'Vinnytsia',
  'Ivano-Frankivsk',
  'Ternopil',
  'Uzhhorod',
  'Chernivtsi',
  'Poltava',
  'Rivne',
  'Lutsk',
  'Mykolaiv',
  'Cherkasy',
];

export const CONDITIONS = [
  { value: 'new', label: 'New' },
  { value: 'used', label: 'Used' },
];

export const PRICE_TYPES = [
  { value: 'fixed', label: 'Fixed price' },
  { value: 'negotiable', label: 'Negotiable' },
  { value: 'free', label: 'Free' },
  { value: 'exchange', label: 'Exchange' },
];

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'price_asc', label: 'Lowest price' },
  { value: 'price_desc', label: 'Highest price' },
  { value: 'popular', label: 'Most viewed' },
];

export const LISTING_LIMITS = {
  titleMin: 10,
  titleMax: 80,
  descriptionMin: 30,
  descriptionMax: 4000,
  maxImages: 8,
  maxImageMb: 12,
  maxPrice: 1_000_000_000,
};

export const PAGE_SIZE = 12;

/** Namespace for every localStorage key the app owns. */
export const STORAGE_PREFIX = 'zruky:';

/** Bump to re-seed demo data on clients that already have an older copy. */
export const SEED_VERSION = 3;

export const DEMO_ACCOUNT = {
  email: 'demo@zruky.app',
  password: 'demo1234',
};
