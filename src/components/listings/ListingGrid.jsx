import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ListingCard, ListingCardSkeleton } from './ListingCard';

export function ListingGrid({ listings, loading = false, skeletonCount = 8, columns = 4 }) {
  return (
    <div className={`lgrid lgrid--${columns}`} aria-busy={loading || undefined}>
      {loading
        ? Array.from({ length: skeletonCount }, (_, i) => <ListingCardSkeleton key={i} />)
        : listings.map((listing, index) => <ListingCard key={listing.id} listing={listing} priority={index < 4} />)}
    </div>
  );
}

/** Horizontally scrolling row with arrow controls on desktop. */
export function ListingRail({ listings, loading = false, label }) {
  const trackRef = useRef(null);

  const scroll = (direction) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: direction * track.clientWidth * 0.85, behavior: 'smooth' });
  };

  return (
    <div className="rail">
      <div className="rail__track" ref={trackRef} role="list" aria-label={label}>
        {loading
          ? Array.from({ length: 5 }, (_, i) => (
              <div className="rail__item" role="listitem" key={i}>
                <ListingCardSkeleton />
              </div>
            ))
          : listings.map((listing) => (
              <div className="rail__item" role="listitem" key={listing.id}>
                <ListingCard listing={listing} />
              </div>
            ))}
      </div>
      <button type="button" className="rail__arrow rail__arrow--prev" onClick={() => scroll(-1)} aria-label="Scroll left">
        <ChevronLeft size={20} />
      </button>
      <button type="button" className="rail__arrow rail__arrow--next" onClick={() => scroll(1)} aria-label="Scroll right">
        <ChevronRight size={20} />
      </button>
    </div>
  );
}
