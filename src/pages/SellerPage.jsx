import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { CalendarDays, Clock, MapPin, Pencil, Store, UserX } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useListings } from '../context/ListingsContext';
import { useDocumentTitle } from '../hooks';
import { formatMonthYear } from '../utils/format';
import { ListingGrid } from '../components/listings/ListingGrid';
import { Avatar, Badge, Breadcrumbs, EmptyState, Rating, SectionHeader, VerifiedMark } from '../components/ui/Display';
import { Button } from '../components/ui/Button';

export default function SellerPage() {
  const { id } = useParams();
  const { user, getUser } = useAuth();
  const { listings, loading } = useListings();
  const seller = getUser(id);
  useDocumentTitle(seller?.name ?? 'Seller not found');

  const { active, soldCount } = useMemo(() => {
    const own = listings.filter((l) => l.sellerId === id);
    return {
      active: own.filter((l) => l.status === 'active').sort((a, b) => b.createdAt - a.createdAt),
      soldCount: own.filter((l) => l.status === 'sold').length,
    };
  }, [listings, id]);

  if (!seller) {
    return (
      <div className="container page">
        <EmptyState as="h1" icon={UserX} title="This profile doesn’t exist" action={<Button variant="dark" to="/">Go home</Button>}>
          The account may have been removed.
        </EmptyState>
      </div>
    );
  }

  const isMe = user?.id === seller.id;

  return (
    <div className="container page">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: seller.name }]} />
      <header className="profile card">
        <Avatar user={seller} size={96} />
        <div className="profile__main">
          <div className="profile__badges">
            <Badge tone={seller.business ? 'brand' : 'neutral'} icon={Store}>
              {seller.business ? 'Business' : 'Private seller'}
            </Badge>
            {seller.verified && <Badge tone="green">Verified</Badge>}
          </div>
          <h1 className="profile__name">
            {seller.name} {seller.verified && <VerifiedMark size={22} />}
          </h1>
          <Rating value={seller.rating} count={seller.reviewsCount} size={16} />
          {seller.bio && <p className="profile__bio">{seller.bio}</p>}
          <ul className="profile__facts">
            {seller.city && (
              <li>
                <MapPin size={16} aria-hidden="true" /> {seller.city}
              </li>
            )}
            <li>
              <CalendarDays size={16} aria-hidden="true" /> Member since {formatMonthYear(seller.createdAt)}
            </li>
            <li>
              <Clock size={16} aria-hidden="true" /> Replies {seller.responseTime}
            </li>
          </ul>
        </div>
        <dl className="profile__stats">
          <div>
            <dt>Active</dt>
            <dd>{active.length}</dd>
          </div>
          <div>
            <dt>Sold</dt>
            <dd>{soldCount}</dd>
          </div>
          <div>
            <dt>Reviews</dt>
            <dd>{seller.reviewsCount ?? 0}</dd>
          </div>
        </dl>
        {isMe && (
          <Button variant="secondary" icon={Pencil} to="/account/settings" className="profile__edit">
            Edit profile
          </Button>
        )}
      </header>

      <section className="section" aria-label="Listings">
        <SectionHeader title={isMe ? 'Your active listings' : `Listings by ${seller.name.split(' ')[0]}`} />
        {!loading && active.length === 0 ? (
          <EmptyState compact title="No active listings right now">
            {isMe ? 'Post something new — it only takes a couple of minutes.' : 'Check back later — new items appear all the time.'}
          </EmptyState>
        ) : (
          <ListingGrid listings={active} loading={loading} />
        )}
      </section>
    </div>
  );
}
