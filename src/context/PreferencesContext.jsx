import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { storage, KEYS } from '../services/storage';

const PreferencesContext = createContext(null);
const MAX_RECENT_VIEWS = 24;
const MAX_RECENT_SEARCHES = 6;

const safeSet = (key, value) => {
  try {
    storage.set(key, value);
  } catch {
    /* preferences are best-effort */
  }
};

/** Per-browser conveniences: preferred city, recently viewed, recent searches. */
export function PreferencesProvider({ children }) {
  const [location, setLocationState] = useState(() => storage.get(KEYS.location, ''));
  const [recentlyViewed, setRecentlyViewed] = useState(() => storage.get(KEYS.recentlyViewed, []));
  const [recentSearches, setRecentSearches] = useState(() => storage.get(KEYS.recentSearches, []));

  const setLocation = useCallback((city) => {
    setLocationState(city);
    safeSet(KEYS.location, city);
  }, []);

  const addRecentlyViewed = useCallback((id) => {
    setRecentlyViewed((current) => {
      if (current[0] === id) return current;
      const next = [id, ...current.filter((x) => x !== id)].slice(0, MAX_RECENT_VIEWS);
      safeSet(KEYS.recentlyViewed, next);
      return next;
    });
  }, []);

  const addRecentSearch = useCallback((query) => {
    const term = query.trim();
    if (!term) return;
    setRecentSearches((current) => {
      const next = [term, ...current.filter((x) => x.toLowerCase() !== term.toLowerCase())].slice(0, MAX_RECENT_SEARCHES);
      safeSet(KEYS.recentSearches, next);
      return next;
    });
  }, []);

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    safeSet(KEYS.recentSearches, []);
  }, []);

  const value = useMemo(
    () => ({
      location,
      setLocation,
      recentlyViewed,
      addRecentlyViewed,
      recentSearches,
      addRecentSearch,
      clearRecentSearches,
    }),
    [location, setLocation, recentlyViewed, addRecentlyViewed, recentSearches, addRecentSearch, clearRecentSearches],
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) throw new Error('usePreferences must be used inside <PreferencesProvider>');
  return context;
}
