import { CalendarDays, ImageOff, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getCategoryById } from '../../data/categories';
import { CONDITIONS } from '../../config/site';
import { formatAttribute, formatPrice, priceNote } from '../../utils/format';
import { resolveImage } from '../../utils/images';
import { Gallery } from '../listings/Gallery';
import { Avatar, Badge, Rating } from '../ui/Display';

/** Converts form values into a listing-shaped object for previews. */
export function draftToListing(values, user) {
  return {
    id: 'preview',
    title: values.title.trim() || 'Your listing title',
    category: values.category,
    price: Number(values.price) || 0,
    priceType: values.priceType,
    condition: values.condition || null,
    location: values.location || 'Your city',
    description: values.description.trim() || 'Your description will appear here.',
    images: values.images,
    attributes: values.attributes,
    sellerId: user?.id,
    createdAt: Date.now(),
    status: 'active',
  };
}

const isPriced = (listing) => listing.priceType === 'fixed' || listing.priceType === 'negotiable';

/** Compact card used in the sticky sidebar while editing. */
export function PreviewCard({ values }) {
  const { user } = useAuth();
  const listing = draftToListing(values, user);
  const note = priceNote(listing);
  return (
    <div className="preview-card">
      <div className="preview-card__media">
        {listing.images[0] ? (
          <img src={resolveImage(listing.images[0], { w: 480, h: 360 })} alt="" />
        ) : (
          <span className="preview-card__empty">
            <ImageOff size={28} aria-hidden="true" />
            Cover photo
          </span>
        )}
        {listing.condition && (
          <Badge tone="light" className="preview-card__badge">
            {listing.condition === 'new' ? 'New' : 'Used'}
          </Badge>
        )}
      </div>
      <div className="preview-card__body">
        <p className="lcard__title">{listing.title}</p>
        <p className="lcard__price">
          <span className={!listing.price && isPriced(listing) ? 'is-placeholder' : ''}>
            {!listing.price && isPriced(listing) ? 'Set a price' : formatPrice(listing)}
          </span>
          {note && <small>{note}</small>}
        </p>
        <p className="lcard__meta">
          <MapPin size={13} aria-hidden="true" /> {listing.location} · Just now
        </p>
      </div>
    </div>
  );
}

/** Full-page style preview shown in a modal before publishing. */
export function ListingPreview({ values }) {
  const { user } = useAuth();
  const listing = draftToListing(values, user);
  const category = getCategoryById(listing.category);
  const note = priceNote(listing);
  const specs = [
    { label: 'Category', value: category?.name },
    listing.condition && { label: 'Condition', value: CONDITIONS.find((c) => c.value === listing.condition)?.label },
    ...(category?.attributes ?? []).map((a) => ({ label: a.label, value: formatAttribute(a, listing.attributes?.[a.key]) })),
  ].filter((row) => row && row.value);

  return (
    <div className="preview">
      {listing.images.length ? (
        <Gallery images={listing.images} title={listing.title} />
      ) : (
        <div className="preview__noimg">
          <ImageOff size={32} aria-hidden="true" />
          Add photos to see them here
        </div>
      )}
      <div className="preview__info">
        <h3 className="pd-summary__title">{listing.title}</h3>
        <p className="pd-summary__price">
          <span>{formatPrice(listing)}</span>
          {note && <small>{note}</small>}
        </p>
        <p className="pd-summary__meta">
          <span>
            <MapPin size={14} aria-hidden="true" /> {listing.location}
          </span>
          <span>
            <CalendarDays size={14} aria-hidden="true" /> Just now
          </span>
        </p>
        {specs.length > 0 && (
          <dl className="pd-specs">
            {specs.map((row) => (
              <div key={row.label}>
                <dt>{row.label}</dt>
                <dd>{row.value}</dd>
              </div>
            ))}
          </dl>
        )}
        <p className="pd-description">{listing.description}</p>
        {user && (
          <div className="preview__seller">
            <Avatar user={user} size={40} />
            <div>
              <strong>{user.name}</strong>
              <Rating value={user.rating} count={user.reviewsCount} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
