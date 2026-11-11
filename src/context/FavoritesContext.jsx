import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { favoritesService, GUEST_KEY } from '../services/favoritesService';
import { useAuth } from './AuthContext';

const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const { user } = useAuth();
  const owner = user?.id ?? GUEST_KEY;
  const [state, setState] = useState(() => ({ owner, ids: favoritesService.get(owner) }));

  // Re-read favorites when the signed-in account changes.
  if (state.owner !== owner) {
    setState({ owner, ids: favoritesService.get(owner) });
  }

  const ids = state.ids;
  const idSet = useMemo(() => new Set(ids), [ids]);
  const isFavorite = useCallback((id) => idSet.has(id), [idSet]);

  /** Returns true when the listing was added, false when removed. */
  const toggleFavorite = useCallback(
    (id) => {
      const adding = !idSet.has(id);
      const next = adding ? [id, ...ids] : ids.filter((x) => x !== id);
      favoritesService.set(owner, next);
      setState({ owner, ids: next });
      return adding;
    },
    [ids, idSet, owner],
  );

  const removeFavorites = useCallback(
    (toRemove) => {
      const drop = new Set(toRemove);
      const next = ids.filter((x) => !drop.has(x));
      favoritesService.set(owner, next);
      setState({ owner, ids: next });
    },
    [ids, owner],
  );

  const value = useMemo(
    () => ({ favoriteIds: ids, count: ids.length, isFavorite, toggleFavorite, removeFavorites }),
    [ids, isFavorite, toggleFavorite, removeFavorites],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error('useFavorites must be used inside <FavoritesProvider>');
  return context;
}
