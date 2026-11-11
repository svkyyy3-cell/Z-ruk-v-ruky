import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Eye, Heart, LayoutList, Pencil, Plus, RotateCcw, Search, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useListings } from '../../context/ListingsContext';
import { useFavorites } from '../../context/FavoritesContext';
import { useToast } from '../../context/ToastContext';
import { favoritesService } from '../../services/favoritesService';
import { getCategoryById } from '../../data/categories';
import { useDocumentTitle } from '../../hooks';
import { matchesQuery } from '../../utils/filters';
import { formatNumber, formatPrice, formatRelative } from '../../utils/format';
import { resolveImage } from '../../utils/images';
import { Button } from '../../components/ui/Button';
import { Badge, EmptyState } from '../../components/ui/Display';
import { Input, Segmented } from '../../components/ui/Field';
import { ConfirmDialog } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Spinner';

const STATUS_FILTERS = ['all', 'active', 'sold'];

export default function MyListingsPage() {
  useDocumentTitle('My listings');
  const { user } = useAuth();
  const { listings, loading, setListingStatus, deleteListing } = useListings();
  const { favoriteIds } = useFavorites();
  const { notify } = useToast();
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const [pendingId, setPendingId] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  const status = STATUS_FILTERS.includes(params.get('status')) ? params.get('status') : 'all';

  const mine = useMemo(
    () => listings.filter((l) => l.sellerId === user.id).sort((a, b) => b.updatedAt - a.updatedAt),
    [listings, user.id],
  );
  // Recomputed when favorites change so counts stay fresh.
  const saves = useMemo(() => (favoriteIds ? favoritesService.saveCounts() : new Map()), [favoriteIds]);

  const counts = {
    all: mine.length,
    active: mine.filter((l) => l.status === 'active').length,
    sold: mine.filter((l) => l.status === 'sold').length,
  };

  const visible = mine.filter((l) => (status === 'all' || l.status === status) && matchesQuery(l, query));

  const changeStatus = async (listing) => {
    const next = listing.status === 'active' ? 'sold' : 'active';
    setPendingId(listing.id);
    try {
      await setListingStatus(listing.id, next);
      notify({
        title: next === 'sold' ? 'Marked as sold' : 'Listing relisted',
        description: next === 'sold' ? 'Nice one! Buyers will see it as sold.' : 'It’s live again and at the top of results.',
      });
    } catch (error) {
      notify({ title: 'Update failed', description: error.message, tone: 'error' });
    } finally {
      setPendingId(null);
    }
  };

  const confirmDelete = async () => {
    setPendingId(toDelete.id);
    try {
      await deleteListing(toDelete.id);
      notify({ title: 'Listing deleted', description: `“${toDelete.title}” was removed.` });
    } catch (error) {
      notify({ title: 'Could not delete', description: error.message, tone: 'error' });
    } finally {
      setPendingId(null);
      setToDelete(null);
    }
  };

  return (
    <section aria-labelledby="my-title">
      <div className="account__section-head">
        <h2 id="my-title">My listings</h2>
        <Button to="/post" icon={Plus} size="sm" variant="dark">
          New listing
        </Button>
      </div>

      <div className="mylist__bar">
        <Segmented
          name="status"
          size="sm"
          value={status}
          onChange={(value) => setParams(value === 'all' ? {} : { status: value }, { replace: true, preventScrollReset: true })}
          options={[
            { value: 'all', label: `All · ${counts.all}` },
            { value: 'active', label: `Active · ${counts.active}` },
            { value: 'sold', label: `Sold · ${counts.sold}` },
          ]}
        />
        {mine.length > 3 && (
          <Input
            icon={Search}
            className="mylist__search"
            placeholder="Search my listings"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search my listings"
          />
        )}
      </div>

      {loading ? (
        <ul className="mylist">
          {[0, 1, 2].map((i) => (
            <li key={i} className="mylist__row card">
              <Skeleton width={120} height={90} radius={12} />
              <div style={{ display: 'grid', gap: 8, flex: 1 }}>
                <Skeleton width="60%" />
                <Skeleton width="30%" height={20} />
              </div>
            </li>
          ))}
        </ul>
      ) : mine.length === 0 ? (
        <EmptyState
          icon={LayoutList}
          title="You haven’t posted anything yet"
          action={
            <Button to="/post" icon={Plus}>
              Post your first ad
            </Button>
          }
        >
          Turn the things you don’t use into money. Posting takes two minutes and is free.
        </EmptyState>
      ) : visible.length === 0 ? (
        <EmptyState compact title="No listings here">
          {query ? `Nothing matches “${query}”.` : `You have no ${status} listings.`}
        </EmptyState>
      ) : (
        <ul className="mylist">
          {visible.map((listing) => {
            const category = getCategoryById(listing.category);
            const sold = listing.status === 'sold';
            return (
              <li key={listing.id} className={`mylist__row card ${sold ? 'is-sold' : ''}`}>
                <Link to={`/listing/${listing.id}`} className="mylist__thumb">
                  <img src={resolveImage(listing.images[0], { w: 240, h: 180 })} alt="" loading="lazy" />
                </Link>
                <div className="mylist__info">
                  <div className="mylist__badges">
                    <Badge tone={sold ? 'neutral' : 'green'}>{sold ? 'Sold' : 'Active'}</Badge>
                    <span className="mylist__cat">{category?.name}</span>
                  </div>
                  <Link to={`/listing/${listing.id}`} className="mylist__title">
                    {listing.title}
                  </Link>
                  <p className="mylist__price">{formatPrice(listing)}</p>
                  <p className="mylist__stats">
                    <span>
                      <Eye size={14} aria-hidden="true" /> {formatNumber(listing.views ?? 0)} views
                    </span>
                    <span>
                      <Heart size={14} aria-hidden="true" /> {saves.get(listing.id) ?? 0} saves
                    </span>
                    <span>Updated {formatRelative(listing.updatedAt)}</span>
                  </p>
                </div>
                <div className="mylist__actions">
                  <Button variant="secondary" size="sm" icon={Pencil} to={`/listing/${listing.id}/edit`}>
                    Edit
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={sold ? RotateCcw : CheckCircle2}
                    onClick={() => changeStatus(listing)}
                    loading={pendingId === listing.id && !toDelete}
                  >
                    {sold ? 'Relist' : 'Mark sold'}
                  </Button>
                  <Button variant="ghost" size="sm" icon={Trash2} onClick={() => setToDelete(listing)} className="mylist__delete">
                    Delete
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        loading={Boolean(toDelete) && pendingId === toDelete?.id}
        title="Delete this listing?"
        description={toDelete ? `“${toDelete.title}” will be permanently removed from the marketplace.` : ''}
        confirmLabel="Delete listing"
      />
    </section>
  );
}
