import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Eye,
  MapPin,
  MessageCircle,
  Pencil,
  Phone,
  RotateCcw,
  Share2,
  ShieldAlert,
  Tag,
  Trash2,
} from 'lucide-react';
import { useListings } from '../context/ListingsContext';
import { useAuth } from '../context/AuthContext';
import { useMessages } from '../context/MessagesContext';
import { usePreferences } from '../context/PreferencesContext';
import { useToast } from '../context/ToastContext';
import { getCategoryById } from '../data/categories';
import { CONDITIONS } from '../config/site';
import { useDocumentTitle } from '../hooks';
import { formatAttribute, formatDate, formatNumber, formatPrice, formatRelative, priceNote } from '../utils/format';
import { similarListings } from '../utils/recommend';
import { Gallery } from '../components/listings/Gallery';
import { SellerCard } from '../components/listings/SellerCard';
import { FavoriteButton } from '../components/listings/FavoriteButton';
import { ListingGrid } from '../components/listings/ListingGrid';
import { Button } from '../components/ui/Button';
import { Badge, Breadcrumbs, EmptyState, SectionHeader } from '../components/ui/Display';
import { ConfirmDialog } from '../components/ui/Modal';
import { PageLoader } from '../components/ui/Spinner';

export default function ListingPage() {
  const { id } = useParams();
  const { listings, getListing, loading, recordView } = useListings();
  const { addRecentlyViewed } = usePreferences();
  const listing = getListing(id);
  const viewed = useRef(null);

  useDocumentTitle(listing?.title ?? (loading ? 'Loading…' : 'Listing not found'));

  useEffect(() => {
    if (!listing || viewed.current === listing.id) return;
    viewed.current = listing.id;
    recordView(listing.id);
    addRecentlyViewed(listing.id);
  }, [listing, recordView, addRecentlyViewed]);

  const similar = useMemo(() => (listing ? similarListings(listing, listings, 8) : []), [listing, listings]);

  if (loading) return <PageLoader label="Loading listing…" />;

  if (!listing) {
    return (
      <div className="container page">
        <EmptyState
          as="h1"
          icon={ShieldAlert}
          title="This listing is no longer available"
          action={
            <>
              <Button variant="dark" to="/search">
                Browse listings
              </Button>
              <Button variant="secondary" to="/">
                Go home
              </Button>
            </>
          }
        >
          It may have been sold or removed by the seller. There are plenty of similar things waiting for you.
        </EmptyState>
      </div>
    );
  }

  return <ListingDetails key={listing.id} listing={listing} similar={similar} />;
}

function ListingDetails({ listing, similar }) {
  const navigate = useNavigate();
  const { user, getUser } = useAuth();
  const { listings, setListingStatus, deleteListing } = useListings();
  const { startConversation } = useMessages();
  const { notify } = useToast();
  const [showPhone, setShowPhone] = useState(false);
  const [contacting, setContacting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);

  const category = getCategoryById(listing.category);
  const seller = getUser(listing.sellerId);
  const isOwner = user?.id === listing.sellerId;
  const sold = listing.status === 'sold';
  const note = priceNote(listing);
  const sellerActive = listings.filter((l) => l.sellerId === listing.sellerId && l.status === 'active').length;

  const details = [
    { label: 'Category', value: category?.name },
    listing.condition && { label: 'Condition', value: CONDITIONS.find((c) => c.value === listing.condition)?.label },
    ...(category?.attributes ?? []).map((attribute) => ({
      label: attribute.label,
      value: formatAttribute(attribute, listing.attributes?.[attribute.key]),
    })),
  ].filter((row) => row && row.value);

  const contact = async () => {
    if (!user) {
      navigate(`/login?next=${encodeURIComponent(`/listing/${listing.id}`)}`);
      return;
    }
    setContacting(true);
    try {
      const conversation = await startConversation(listing);
      navigate(`/messages/${conversation.id}`);
    } catch (error) {
      notify({ title: 'Could not open chat', description: error.message, tone: 'error' });
      setContacting(false);
    }
  };

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: listing.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        notify({ title: 'Link copied', description: 'Share it with anyone.', tone: 'success' });
      }
    } catch (error) {
      if (error?.name !== 'AbortError') notify({ title: 'Could not share this listing', tone: 'error' });
    }
  };

  const toggleSold = async () => {
    setBusy(true);
    try {
      await setListingStatus(listing.id, sold ? 'active' : 'sold');
      notify({ title: sold ? 'Listing is active again' : 'Marked as sold', description: sold ? 'It’s back at the top of results.' : 'Congratulations on the sale! 🎉' });
    } catch (error) {
      notify({ title: 'Update failed', description: error.message, tone: 'error' });
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      await deleteListing(listing.id);
      notify({ title: 'Listing deleted' });
      navigate('/account/listings');
    } catch (error) {
      notify({ title: 'Could not delete', description: error.message, tone: 'error' });
      setBusy(false);
      setConfirmDelete(false);
    }
  };

  const ownerActions = (
    <div className="pd-actions">
      <Button variant="dark" icon={Pencil} to={`/listing/${listing.id}/edit`} block>
        Edit listing
      </Button>
      <div className="pd-actions__row">
        <Button variant="secondary" icon={sold ? RotateCcw : CheckCircle2} onClick={toggleSold} loading={busy && !confirmDelete}>
          {sold ? 'Relist' : 'Mark as sold'}
        </Button>
        <Button variant="secondary" icon={Trash2} onClick={() => setConfirmDelete(true)}>
          Delete
        </Button>
      </div>
    </div>
  );

  const buyerActions = (
    <div className="pd-actions">
      <Button size="lg" icon={MessageCircle} onClick={contact} loading={contacting} disabled={sold} block>
        {sold ? 'Item sold' : 'Message seller'}
      </Button>
      {seller?.phone && !sold && (
        <Button
          size="lg"
          variant="secondary"
          icon={Phone}
          block
          href={showPhone ? `tel:${seller.phone.replace(/\s/g, '')}` : undefined}
          onClick={showPhone ? undefined : () => setShowPhone(true)}
        >
          {showPhone ? seller.phone : 'Show phone number'}
        </Button>
      )}
    </div>
  );

  return (
    <div className="container page pd">
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: category?.name ?? 'Listings', to: category ? `/c/${category.slug}` : '/search' },
          { label: listing.title },
        ]}
      />

      {sold && (
        <div className="pd-banner" role="status">
          <CheckCircle2 size={18} aria-hidden="true" />
          This item has been sold. {isOwner ? 'Relist it if it became available again.' : 'Check out similar listings below.'}
        </div>
      )}

      <div className="pd__layout">
        <div className="pd__main">
          <Gallery images={listing.images} title={listing.title} />

          <section className="pd-section card" aria-labelledby="pd-desc">
            <h2 id="pd-desc" className="pd-section__title">
              Description
            </h2>
            <p className="pd-description">{listing.description}</p>
          </section>

          {details.length > 0 && (
            <section className="pd-section card" aria-labelledby="pd-details">
              <h2 id="pd-details" className="pd-section__title">
                Details
              </h2>
              <dl className="pd-specs">
                {details.map((row) => (
                  <div key={row.label}>
                    <dt>{row.label}</dt>
                    <dd>{row.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          <section className="pd-section card pd-location" aria-labelledby="pd-location">
            <span className="pd-location__pin" aria-hidden="true">
              <MapPin size={22} />
            </span>
            <div>
              <h2 id="pd-location" className="pd-section__title">
                {listing.location}
              </h2>
              <p className="muted">Exact address is shared by the seller in chat.</p>
            </div>
            <Link to={`/search?location=${encodeURIComponent(listing.location)}`} className="text-link pd-location__link">
              More in {listing.location}
            </Link>
          </section>

          <p className="pd-meta">
            <span>ID: {listing.id}</span>
            <span>
              <Eye size={14} aria-hidden="true" /> {formatNumber(listing.views ?? 0)} views
            </span>
            <span>
              <CalendarDays size={14} aria-hidden="true" /> Published {formatDate(listing.createdAt)}
            </span>
          </p>
        </div>

        <aside className="pd__aside">
          <section className="pd-summary card">
            <div className="pd-summary__top">
              <div className="pd-summary__badges">
                {listing.featured && !sold && <Badge tone="sun">Featured</Badge>}
                {listing.condition && <Badge tone="neutral">{listing.condition === 'new' ? 'New' : 'Used'}</Badge>}
                {listing.priceType === 'negotiable' && <Badge tone="green">Negotiable</Badge>}
                {listing.priceType === 'exchange' && <Badge tone="brand">Open to exchange</Badge>}
              </div>
              <div className="pd-summary__tools">
                <button type="button" className="icon-btn icon-btn--surface" onClick={share} aria-label="Share listing" title="Share">
                  <Share2 size={18} />
                </button>
                {!isOwner && <FavoriteButton listing={listing} className="pd-summary__fav" />}
              </div>
            </div>

            <h1 className="pd-summary__title">{listing.title}</h1>
            <p className="pd-summary__price">
              <span className={listing.priceType === 'free' ? 'is-free' : ''}>{formatPrice(listing)}</span>
              {note && <small>{note}</small>}
            </p>
            {listing.priceType === 'exchange' && listing.price > 0 && (
              <p className="pd-summary__hint">
                <Tag size={14} aria-hidden="true" /> Estimated value {formatPrice({ ...listing, priceType: 'fixed' })}
              </p>
            )}
            <p className="pd-summary__meta">
              <span>
                <MapPin size={14} aria-hidden="true" /> {listing.location}
              </span>
              <span>
                <CalendarDays size={14} aria-hidden="true" /> {formatRelative(listing.createdAt)}
              </span>
            </p>

            {isOwner ? ownerActions : buyerActions}
            {isOwner && (
              <p className="pd-owner-note">
                This is your listing · {formatNumber(listing.views ?? 0)} views
              </p>
            )}
          </section>

          <SellerCard seller={seller} activeCount={sellerActive} />

          <section className="pd-safety card">
            <h2>
              <ShieldAlert size={18} aria-hidden="true" /> Stay safe
            </h2>
            <ul>
              <li>Never pay in advance or share card details.</li>
              <li>Meet in a public place and check the item first.</li>
              <li>Keep the conversation inside Zruky chat.</li>
            </ul>
            <Link to="/safety" className="text-link">
              More safety tips
            </Link>
          </section>
        </aside>
      </div>

      {similar.length > 0 && (
        <section className="section" aria-label="Similar listings">
          <SectionHeader
            title="Similar listings"
            action={
              category && (
                <Button variant="ghost" size="sm" to={`/c/${category.slug}`} iconRight={ArrowRight}>
                  More in {category.name}
                </Button>
              )
            }
          />
          <ListingGrid listings={similar} />
        </section>
      )}

      <div className="pd-sticky">
        <div className="pd-sticky__price">
          <strong>{formatPrice(listing)}</strong>
          {note && <small>{note}</small>}
        </div>
        {isOwner ? (
          <Button variant="dark" icon={Pencil} to={`/listing/${listing.id}/edit`}>
            Edit
          </Button>
        ) : (
          <Button icon={MessageCircle} onClick={contact} loading={contacting} disabled={sold}>
            {sold ? 'Sold' : 'Message'}
          </Button>
        )}
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={remove}
        loading={busy}
        title="Delete this listing?"
        description="It will be removed from the marketplace and buyers will no longer be able to find it. This can’t be undone."
        confirmLabel="Delete listing"
      />
    </div>
  );
}
