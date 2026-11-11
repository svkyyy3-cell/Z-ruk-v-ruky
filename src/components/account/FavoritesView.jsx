import { useMemo, useState } from 'react';
import { Heart, Trash2 } from 'lucide-react';
import { useFavorites } from '../../context/FavoritesContext';
import { useListings } from '../../context/ListingsContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { pluralize } from '../../utils/format';
import { ListingGrid } from '../listings/ListingGrid';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/Display';
import { Segmented } from '../ui/Field';
import { ConfirmDialog } from '../ui/Modal';

export function FavoritesView({ columns = 4 }) {
  const { favoriteIds, removeFavorites } = useFavorites();
  const { getListing, loading } = useListings();
  const { user } = useAuth();
  const { notify } = useToast();
  const [filter, setFilter] = useState('all');
  const [confirmClear, setConfirmClear] = useState(false);

  // Listings removed by their sellers simply disappear from favorites.
  const saved = useMemo(() => favoriteIds.map(getListing).filter(Boolean), [favoriteIds, getListing]);
  const visible = saved.filter((l) => filter === 'all' || l.status === filter);
  const soldCount = saved.filter((l) => l.status === 'sold').length;

  const clearAll = () => {
    removeFavorites(favoriteIds);
    setConfirmClear(false);
    notify({ title: 'Favorites cleared', tone: 'info' });
  };

  if (!loading && saved.length === 0) {
    return (
      <EmptyState
        icon={Heart}
        title="No favorites yet"
        action={
          <Button variant="dark" to="/search">
            Start browsing
          </Button>
        }
      >
        Tap the heart on any listing to save it here and compare later.
        {!user && ' Log in to keep favorites across devices.'}
      </EmptyState>
    );
  }

  return (
    <div className="favorites">
      <div className="favorites__bar">
        <Segmented
          name="favorites-filter"
          size="sm"
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'all', label: `All · ${saved.length}` },
            { value: 'active', label: `Available · ${saved.length - soldCount}` },
            { value: 'sold', label: `Sold · ${soldCount}` },
          ]}
        />
        <Button variant="ghost" size="sm" icon={Trash2} onClick={() => setConfirmClear(true)}>
          Clear all
        </Button>
      </div>
      {visible.length ? (
        <ListingGrid listings={visible} loading={loading} columns={columns} />
      ) : (
        <EmptyState compact title="Nothing here">
          No {filter === 'sold' ? 'sold' : 'available'} listings among your favorites.
        </EmptyState>
      )}
      <ConfirmDialog
        open={confirmClear}
        onClose={() => setConfirmClear(false)}
        onConfirm={clearAll}
        title="Clear all favorites?"
        description={`This removes ${pluralize(saved.length, 'saved listing')} from your favorites.`}
        confirmLabel="Clear favorites"
      />
    </div>
  );
}
