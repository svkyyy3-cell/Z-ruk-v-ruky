import { useMemo } from 'react';
import { ArrowRight } from 'lucide-react';
import { useListings } from '../context/ListingsContext';
import { useFavorites } from '../context/FavoritesContext';
import { usePreferences } from '../context/PreferencesContext';
import { useDocumentTitle } from '../hooks';
import { recommendedListings } from '../utils/recommend';
import { Hero } from '../components/home/Hero';
import { CategoryTiles, PopularCategories, PromoBanners, TrustStrip } from '../components/home/HomeSections';
import { ListingGrid, ListingRail } from '../components/listings/ListingGrid';
import { Button } from '../components/ui/Button';
import { SectionHeader } from '../components/ui/Display';

export default function HomePage() {
  useDocumentTitle(null);
  const { listings, loading } = useListings();
  const { favoriteIds } = useFavorites();
  const { recentlyViewed, location } = usePreferences();

  const data = useMemo(() => {
    const active = listings.filter((l) => l.status === 'active');
    const counts = new Map();
    active.forEach((l) => counts.set(l.category, (counts.get(l.category) ?? 0) + 1));
    const featured = active.filter((l) => l.featured).sort((a, b) => b.createdAt - a.createdAt);
    const recent = [...active].sort((a, b) => b.createdAt - a.createdAt).slice(0, 8);
    const nearby = location ? active.filter((l) => l.location === location).sort((a, b) => b.createdAt - a.createdAt) : [];
    const recommended = recommendedListings({ listings: active, recentlyViewed, favoriteIds });
    return { counts, featured, recent, nearby, recommended };
  }, [listings, recentlyViewed, favoriteIds, location]);

  return (
    <>
      <Hero listings={listings} />

      <div className="container home">
        <section className="section section--first" aria-labelledby="cats-title">
          <SectionHeader
            title={<span id="cats-title">Browse categories</span>}
            action={
              <Button variant="ghost" size="sm" to="/categories" iconRight={ArrowRight}>
                All categories
              </Button>
            }
          />
          <CategoryTiles counts={data.counts} />
        </section>

        <section className="section" aria-label="Featured listings">
          <SectionHeader
            eyebrow="Hand-picked"
            title="Featured listings"
            subtitle="Standout offers from trusted sellers."
            action={
              <Button variant="ghost" size="sm" to="/search?sort=popular" iconRight={ArrowRight}>
                See more
              </Button>
            }
          />
          <ListingRail listings={data.featured} loading={loading} label="Featured listings" />
        </section>

        {data.nearby.length > 0 && (
          <section className="section" aria-label={`Near you in ${location}`}>
            <SectionHeader
              eyebrow="Near you"
              title={`Fresh in ${location}`}
              action={
                <Button variant="ghost" size="sm" to={`/search?location=${encodeURIComponent(location)}`} iconRight={ArrowRight}>
                  All in {location}
                </Button>
              }
            />
            <ListingRail listings={data.nearby.slice(0, 10)} label={`Listings in ${location}`} />
          </section>
        )}

        <section className="section" aria-label="Promotions">
          <PromoBanners vehiclesCount={data.counts.get('vehicles') ?? 0} />
        </section>

        <section className="section" aria-label="Recently added">
          <SectionHeader
            eyebrow="Just in"
            title="Recently added"
            action={
              <Button variant="ghost" size="sm" to="/search?sort=newest" iconRight={ArrowRight}>
                View all
              </Button>
            }
          />
          <ListingGrid listings={data.recent} loading={loading} />
        </section>

        <section className="section" aria-label="Popular categories">
          <SectionHeader eyebrow="Trending" title="Popular categories" subtitle="Where most deals happen this week." />
          <PopularCategories counts={data.counts} />
        </section>

        <section className="section" aria-label="Recommended for you">
          <SectionHeader
            eyebrow={data.recommended.personalised ? 'Based on your activity' : 'Popular right now'}
            title="Recommended for you"
            subtitle={
              data.recommended.personalised
                ? 'Picked from categories you’ve been browsing and saving.'
                : 'Browse and save a few listings — we’ll tailor this to you.'
            }
          />
          <ListingGrid listings={data.recommended.items} loading={loading} />
        </section>

        <section className="section" aria-label="Why Zruky">
          <TrustStrip />
        </section>
      </div>
    </>
  );
}
