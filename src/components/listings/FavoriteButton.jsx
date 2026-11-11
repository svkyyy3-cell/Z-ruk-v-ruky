import { Heart } from 'lucide-react';
import { useFavorites } from '../../context/FavoritesContext';
import { useToast } from '../../context/ToastContext';

export function FavoriteButton({ listing, variant = 'floating', className = '' }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { notify } = useToast();
  const active = isFavorite(listing.id);

  const onClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const added = toggleFavorite(listing.id);
    notify(
      added
        ? { title: 'Saved to favorites', tone: 'success', action: { to: '/favorites', label: 'View' } }
        : { title: 'Removed from favorites', tone: 'info' },
    );
  };

  const label = active ? 'Remove from favorites' : 'Save to favorites';

  if (variant === 'button') {
    return (
      <button type="button" className={`btn btn--secondary btn--md fav-btn-wide ${active ? 'is-active' : ''} ${className}`} onClick={onClick} aria-pressed={active}>
        <Heart size={18} fill={active ? 'currentColor' : 'none'} aria-hidden="true" />
        <span>{active ? 'Saved' : 'Save'}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      className={`fav-btn ${active ? 'is-active' : ''} ${className}`}
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
      title={label}
    >
      <Heart size={18} fill={active ? 'currentColor' : 'none'} aria-hidden="true" />
    </button>
  );
}
