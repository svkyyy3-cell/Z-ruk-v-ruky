import { storage, KEYS } from './storage';

/**
 * Favorites are stored per owner: a user id, or "guest" for visitors who are
 * not signed in. Guest favorites are merged into the account on sign-in.
 */
export const GUEST_KEY = 'guest';

const readAll = () => storage.get(KEYS.favorites, {});

export const favoritesService = {
  get(ownerKey) {
    const ids = readAll()[ownerKey];
    return Array.isArray(ids) ? ids : [];
  },

  set(ownerKey, ids) {
    storage.set(KEYS.favorites, { ...readAll(), [ownerKey]: ids });
    return ids;
  },

  /** How many people saved each listing (shown to sellers). */
  saveCounts() {
    const counts = new Map();
    Object.values(readAll()).forEach((ids) => {
      if (Array.isArray(ids)) ids.forEach((id) => counts.set(id, (counts.get(id) ?? 0) + 1));
    });
    return counts;
  },

  mergeGuestInto(userId) {
    const all = readAll();
    const guest = all[GUEST_KEY] ?? [];
    if (!guest.length) return all[userId] ?? [];
    const merged = Array.from(new Set([...guest, ...(all[userId] ?? [])]));
    storage.set(KEYS.favorites, { ...all, [userId]: merged, [GUEST_KEY]: [] });
    return merged;
  },
};
