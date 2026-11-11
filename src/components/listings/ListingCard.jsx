import { memo } from 'react';
import { Link } from 'react-router-dom';
import { Images, MapPin, Sparkles } from 'lucide-react';
import { formatPrice, formatRelative, priceNote } from '../../utils/format';
import { imageSrcSet, resolveImage } from '../../utils/images';
import { getCategoryById } from '../../data/categories';
import { Badge } from '../ui/Display';
import { Skeleton } from '../ui/Spinner';
import { FavoriteButton } from './FavoriteButton';

const CONDITION_LABEL = { new: 'New', used: 'Used' };

export const ListingCard = memo(function ListingCard({ listing, priority = false }) {
  const category = getCategoryById(listing.category);
  const note = priceNote(listing);
  const sold = listing.status === 'sold';

  return (
    <article className={`lcard ${sold ? 'lcard--sold' : ''}`}>
      <Link to={`/listing/${listing.id}`} className="lcard__link" aria-label={`${listing.title}, ${formatPrice(listing)}`}>
        <div className="lcard__media">
          <img
            src={resolveImage(listing.images[0], { w: 480, h: 360 })}
            srcSet={imageSrcSet(listing.images[0], 480, 360)}
            alt=""
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
          />
          <div className="lcard__badges">
            {listing.featured && !sold && (
              <Badge tone="sun" icon={Sparkles}>
                Featured
              </Badge>
            )}
            {sold && <Badge tone="dark">Sold</Badge>}
            {listing.condition && !sold && <Badge tone="light">{CONDITION_LABEL[listing.condition]}</Badge>}
          </div>
          {listing.images.length > 1 && (
            <span className="lcard__count">
              <Images size={12} aria-hidden="true" />
              {listing.images.length}
            </span>
          )}
        </div>
        <div className="lcard__body">
          <p className="lcard__category">{category?.name}</p>
          <h3 className="lcard__title">{listing.title}</h3>
          <p className="lcard__price">
            <span className={listing.priceType === 'free' ? 'is-free' : ''}>{formatPrice(listing)}</span>
            {note && <small>{note}</small>}
          </p>
          <p className="lcard__meta">
            <span className="lcard__location">
              <MapPin size={13} aria-hidden="true" />
              {listing.location}
            </span>
            <span aria-hidden="true">·</span>
            <time dateTime={new Date(listing.createdAt).toISOString()}>{formatRelative(listing.createdAt)}</time>
          </p>
        </div>
      </Link>
      <FavoriteButton listing={listing} className="lcard__fav" />
    </article>
  );
});

export function ListingCardSkeleton() {
  return (
    <div className="lcard lcard--skeleton" aria-hidden="true">
      <Skeleton className="lcard__media" height="auto" radius="var(--radius)" />
      <div className="lcard__body">
        <Skeleton width="40%" height={10} />
        <Skeleton width="92%" height={14} />
        <Skeleton width="55%" height={20} />
        <Skeleton width="70%" height={11} />
      </div>
    </div>
  );
}
