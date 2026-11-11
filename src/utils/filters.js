import { SORT_OPTIONS } from '../config/site';
import { getCategoryById } from '../data/categories';

/**
 * Filters live in the URL so results are shareable and the back button works.
 *
 *   q, location, condition, min, max, sort
 *   f_<attr>               → select attribute
 *   f_<attr>_min / _max    → range attribute
 */

const SORT_VALUES = new Set(SORT_OPTIONS.map((o) => o.value));

function readNumber(params, key) {
  const raw = params.get(key);
  if (raw === null || raw.trim() === '') return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

export function readFilters(params, category) {
  const attrs = {};
  category?.attributes.forEach((attribute) => {
    if (attribute.filter === 'range') {
      const min = readNumber(params, `f_${attribute.key}_min`);
      const max = readNumber(params, `f_${attribute.key}_max`);
      if (min !== null || max !== null) attrs[attribute.key] = { min, max };
    } else {
      const value = params.get(`f_${attribute.key}`);
      if (value) attrs[attribute.key] = value;
    }
  });

  const sort = params.get('sort');
  return {
    q: (params.get('q') ?? '').trim(),
    location: params.get('location') ?? '',
    condition: params.get('condition') ?? '',
    minPrice: readNumber(params, 'min'),
    maxPrice: readNumber(params, 'max'),
    sort: SORT_VALUES.has(sort) ? sort : 'newest',
    attrs,
  };
}

/** Number of filters applied (excluding keyword and sort). */
export function countActiveFilters(filters) {
  let count = Object.keys(filters.attrs).length;
  if (filters.location) count += 1;
  if (filters.condition) count += 1;
  if (filters.minPrice !== null || filters.maxPrice !== null) count += 1;
  return count;
}

const normalize = (text) =>
  String(text ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

function searchableText(listing) {
  const category = getCategoryById(listing.category);
  return normalize(
    [listing.title, listing.description, listing.location, category?.name, ...Object.values(listing.attributes ?? {})].join(
      ' ',
    ),
  );
}

/** Every word of the query must appear somewhere in the listing. */
export function matchesQuery(listing, query) {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  if (!terms.length) return true;
  const haystack = searchableText(listing);
  return terms.every((term) => haystack.includes(term));
}

function matchesAttributes(listing, attrs) {
  return Object.entries(attrs).every(([key, expected]) => {
    const actual = listing.attributes?.[key];
    if (typeof expected === 'object') {
      if (actual === undefined || actual === null || actual === '') return false;
      const value = Number(actual);
      if (expected.min !== null && value < expected.min) return false;
      if (expected.max !== null && value > expected.max) return false;
      return true;
    }
    return String(actual) === String(expected);
  });
}

const SORTERS = {
  newest: (a, b) => b.createdAt - a.createdAt,
  price_asc: (a, b) => a.price - b.price || b.createdAt - a.createdAt,
  price_desc: (a, b) => b.price - a.price || b.createdAt - a.createdAt,
  popular: (a, b) => (b.views ?? 0) - (a.views ?? 0),
};

export function applyFilters(listings, filters, { categoryId } = {}) {
  const result = listings.filter((listing) => {
    if (listing.status !== 'active') return false;
    if (categoryId && listing.category !== categoryId) return false;
    if (filters.location && listing.location !== filters.location) return false;
    if (filters.condition && listing.condition !== filters.condition) return false;
    if (filters.minPrice !== null && listing.price < filters.minPrice) return false;
    if (filters.maxPrice !== null && listing.price > filters.maxPrice) return false;
    if (!matchesAttributes(listing, filters.attrs)) return false;
    return matchesQuery(listing, filters.q);
  });
  return result.sort(SORTERS[filters.sort] ?? SORTERS.newest);
}

/** Keys that belong to a specific category and must be dropped when it changes. */
export function isAttributeParam(key) {
  return key.startsWith('f_');
}
