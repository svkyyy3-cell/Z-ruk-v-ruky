import { storage, KEYS } from './storage';
import { ApiError, createId, simulate } from './api';

/**
 * Listings repository backed by localStorage. All methods are async so the
 * implementation can later be swapped for REST/GraphQL calls.
 */

const read = () => storage.get(KEYS.listings, []);
const write = (listings) => storage.set(KEYS.listings, listings);

function assertOwner(listing, userId) {
  if (!listing) throw new ApiError('This listing no longer exists.', { status: 404 });
  if (listing.sellerId !== userId) throw new ApiError('You can only manage your own listings.', { status: 403 });
}

const EDITABLE = ['title', 'category', 'price', 'priceType', 'condition', 'location', 'description', 'images', 'attributes'];
const pickEditable = (data) => Object.fromEntries(EDITABLE.filter((key) => key in data).map((key) => [key, data[key]]));

export const listingsService = {
  async list() {
    return simulate(() => read(), 350);
  },

  async create(data, userId) {
    return simulate(() => {
      const now = Date.now();
      const listing = {
        ...pickEditable(data),
        id: createId('l'),
        sellerId: userId,
        status: 'active',
        featured: false,
        views: 0,
        createdAt: now,
        updatedAt: now,
        origin: 'user',
      };
      write([listing, ...read()]);
      return listing;
    }, 500);
  },

  async update(id, data, userId) {
    return simulate(() => {
      const listings = read();
      const index = listings.findIndex((l) => l.id === id);
      assertOwner(listings[index], userId);
      listings[index] = { ...listings[index], ...pickEditable(data), updatedAt: Date.now() };
      write(listings);
      return listings[index];
    }, 450);
  },

  async setStatus(id, status, userId) {
    return simulate(() => {
      const listings = read();
      const index = listings.findIndex((l) => l.id === id);
      assertOwner(listings[index], userId);
      listings[index] = {
        ...listings[index],
        status,
        updatedAt: Date.now(),
        // Relisting bumps the listing to the top of "newest".
        ...(status === 'active' ? { createdAt: Date.now() } : {}),
      };
      write(listings);
      return listings[index];
    }, 250);
  },

  async remove(id, userId) {
    return simulate(() => {
      const listings = read();
      assertOwner(
        listings.find((l) => l.id === id),
        userId,
      );
      write(listings.filter((l) => l.id !== id));
      return id;
    }, 300);
  },

  /** Fire-and-forget view counter. */
  recordView(id) {
    try {
      const listings = read();
      const listing = listings.find((l) => l.id === id);
      if (!listing) return null;
      listing.views = (listing.views || 0) + 1;
      write(listings);
      return listing.views;
    } catch {
      return null;
    }
  },
};
