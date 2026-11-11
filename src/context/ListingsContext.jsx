import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { listingsService } from '../services/listingsService';
import { useAuth } from './AuthContext';

const ListingsContext = createContext(null);

export function ListingsProvider({ children }) {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);

  const fetchListings = useCallback(() => {
    return listingsService
      .list()
      .then((data) => {
        setListings(data);
        setError(null);
        setStatus('ready');
      })
      .catch((err) => {
        setError(err);
        setStatus('error');
      });
  }, []);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const reload = useCallback(() => {
    setStatus('loading');
    return fetchListings();
  }, [fetchListings]);

  const byId = useMemo(() => new Map(listings.map((l) => [l.id, l])), [listings]);
  const getListing = useCallback((id) => byId.get(id) ?? null, [byId]);

  const replace = (updated) => setListings((current) => current.map((l) => (l.id === updated.id ? updated : l)));

  const requireUser = useCallback(() => {
    if (!user) throw new Error('Please sign in first.');
    return user.id;
  }, [user]);

  const createListing = useCallback(
    async (data) => {
      const created = await listingsService.create(data, requireUser());
      setListings((current) => [created, ...current]);
      return created;
    },
    [requireUser],
  );

  const updateListing = useCallback(
    async (id, data) => {
      const updated = await listingsService.update(id, data, requireUser());
      replace(updated);
      return updated;
    },
    [requireUser],
  );

  const setListingStatus = useCallback(
    async (id, nextStatus) => {
      const updated = await listingsService.setStatus(id, nextStatus, requireUser());
      replace(updated);
      return updated;
    },
    [requireUser],
  );

  const deleteListing = useCallback(
    async (id) => {
      await listingsService.remove(id, requireUser());
      setListings((current) => current.filter((l) => l.id !== id));
    },
    [requireUser],
  );

  const recordView = useCallback((id) => {
    const views = listingsService.recordView(id);
    if (views !== null) setListings((current) => current.map((l) => (l.id === id ? { ...l, views } : l)));
  }, []);

  const value = useMemo(
    () => ({
      listings,
      status,
      error,
      loading: status === 'loading',
      reload,
      getListing,
      createListing,
      updateListing,
      setListingStatus,
      deleteListing,
      recordView,
    }),
    [listings, status, error, reload, getListing, createListing, updateListing, setListingStatus, deleteListing, recordView],
  );

  return <ListingsContext.Provider value={value}>{children}</ListingsContext.Provider>;
}

export function useListings() {
  const context = useContext(ListingsContext);
  if (!context) throw new Error('useListings must be used inside <ListingsProvider>');
  return context;
}
