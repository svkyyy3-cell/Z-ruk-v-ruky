import { STORAGE_PREFIX } from '../config/site';

/** Raised when the browser refuses to store more data (usually images). */
export class StorageQuotaError extends Error {
  constructor() {
    super('Your browser storage is full. Try using fewer or smaller photos, or delete old listings.');
    this.name = 'StorageQuotaError';
  }
}

const memoryStore = new Map();

function getBackend() {
  try {
    const probe = `${STORAGE_PREFIX}__probe`;
    window.localStorage.setItem(probe, '1');
    window.localStorage.removeItem(probe);
    return window.localStorage;
  } catch {
    // Private mode / disabled storage: fall back to an in-memory store so the
    // app keeps working for the current session.
    return {
      getItem: (k) => (memoryStore.has(k) ? memoryStore.get(k) : null),
      setItem: (k, v) => memoryStore.set(k, String(v)),
      removeItem: (k) => memoryStore.delete(k),
    };
  }
}

const backend = getBackend();

function isQuotaError(error) {
  return (
    error instanceof DOMException &&
    (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED' || error.code === 22)
  );
}

/** Thin JSON wrapper around localStorage, namespaced and failure-tolerant. */
export const storage = {
  get(key, fallback = null) {
    try {
      const raw = backend.getItem(STORAGE_PREFIX + key);
      return raw == null ? fallback : JSON.parse(raw);
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      backend.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    } catch (error) {
      if (isQuotaError(error)) throw new StorageQuotaError();
      throw error;
    }
  },
  remove(key) {
    try {
      backend.removeItem(STORAGE_PREFIX + key);
    } catch {
      /* ignore */
    }
  },
};

export const KEYS = {
  seedVersion: 'seed-version',
  users: 'users',
  session: 'session',
  listings: 'listings',
  favorites: 'favorites',
  conversations: 'conversations',
  location: 'preferred-location',
  recentlyViewed: 'recently-viewed',
  recentSearches: 'recent-searches',
  draft: 'listing-draft',
};
