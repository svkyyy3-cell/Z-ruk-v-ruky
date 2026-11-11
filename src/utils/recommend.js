/**
 * Lightweight, explainable recommendation logic. A backend could replace
 * these with a real ranking service without changing the UI.
 */

/** Listings similar to `listing`: same category, scored by shared traits. */
export function similarListings(listing, listings, limit = 8) {
  return listings
    .filter((l) => l.id !== listing.id && l.status === 'active' && l.category === listing.category)
    .map((candidate) => {
      let score = 0;
      Object.entries(listing.attributes ?? {}).forEach(([key, value]) => {
        if (candidate.attributes?.[key] === value) score += 2;
      });
      if (candidate.location === listing.location) score += 1.5;
      if (listing.price > 0 && candidate.price > 0) {
        const ratio = candidate.price / listing.price;
        if (ratio > 0.5 && ratio < 2) score += 1;
      }
      score += Math.min(candidate.views ?? 0, 1000) / 1000;
      return { candidate, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.candidate);
}

/**
 * "Recommended for you": weights categories by what the visitor viewed and
 * saved, then picks popular unseen listings from those categories.
 */
export function recommendedListings({ listings, recentlyViewed, favoriteIds, limit = 8 }) {
  const byId = new Map(listings.map((l) => [l.id, l]));
  const weights = new Map();
  const bump = (id, amount) => {
    const listing = byId.get(id);
    if (listing) weights.set(listing.category, (weights.get(listing.category) ?? 0) + amount);
  };
  recentlyViewed.forEach((id, index) => bump(id, Math.max(1, 5 - index * 0.3)));
  favoriteIds.forEach((id) => bump(id, 3));

  const seen = new Set([...recentlyViewed, ...favoriteIds]);
  const personalised = weights.size > 0;

  const ranked = listings
    .filter((l) => l.status === 'active' && !seen.has(l.id))
    .map((l) => ({
      listing: l,
      score: (weights.get(l.category) ?? 0) * 100 + (l.views ?? 0) / 10 + (l.featured ? 15 : 0),
    }))
    .sort((a, b) => b.score - a.score);

  // Keep some variety: at most 3 listings per category.
  const perCategory = new Map();
  const picked = [];
  for (const { listing } of ranked) {
    const used = perCategory.get(listing.category) ?? 0;
    if (used >= 3) continue;
    perCategory.set(listing.category, used + 1);
    picked.push(listing);
    if (picked.length === limit) break;
  }
  return { items: picked, personalised };
}
