import { DEMO_ACCOUNT, SEED_VERSION } from '../config/site';
import { SEED_LISTINGS } from '../data/listings';
import { SEED_USERS, DEMO_USER_ID } from '../data/users';
import { SEED_CONVERSATIONS } from '../data/conversations';
import { storage, KEYS } from './storage';
import { hashPassword } from './api';

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

const DEMO_FAVORITES = ['l-cognac-sofa', 'l-bmw-m4', 'l-pechersk-2room', 'l-beagle', 'l-sony-a7iii'];

function buildListings(now) {
  return SEED_LISTINGS.map(({ hoursAgo, ...listing }) => {
    const createdAt = now - hoursAgo * HOUR;
    return {
      status: 'active',
      condition: null,
      featured: false,
      views: 0,
      attributes: {},
      ...listing,
      createdAt,
      updatedAt: createdAt,
      origin: 'seed',
    };
  });
}

async function buildUsers(now) {
  const demoHash = await hashPassword(DEMO_ACCOUNT.password);
  return SEED_USERS.map(({ memberSinceDays, ...user }) => ({
    email: null,
    business: false,
    ...user,
    createdAt: now - memberSinceDays * DAY,
    passwordHash: user.id === DEMO_USER_ID ? demoHash : null,
    origin: 'seed',
  }));
}

function buildConversations(now) {
  return SEED_CONVERSATIONS.map(({ messages, unreadFor, ...conversation }) => {
    const built = messages.map((m, index) => ({
      id: `${conversation.id}-m${index}`,
      senderId: m.from,
      text: m.text,
      createdAt: now - m.hoursAgo * HOUR,
    }));
    const lastAt = built[built.length - 1].createdAt;
    const participants = [conversation.buyerId, conversation.sellerId];
    const lastReadAt = Object.fromEntries(
      participants.map((id) => [id, id === unreadFor ? built[0].createdAt - 1 : lastAt]),
    );
    return { ...conversation, messages: built, lastReadAt, updatedAt: lastAt, origin: 'seed' };
  });
}

/**
 * Writes demo data on first launch (or when SEED_VERSION changes) while
 * keeping everything users created themselves.
 */
export async function ensureSeeded() {
  if (storage.get(KEYS.seedVersion) === SEED_VERSION) return;

  const now = Date.now();
  const keepUserMade = (items) => (Array.isArray(items) ? items.filter((item) => item.origin !== 'seed') : []);

  const users = await buildUsers(now);
  storage.set(KEYS.users, [...users, ...keepUserMade(storage.get(KEYS.users))]);
  storage.set(KEYS.listings, [...buildListings(now), ...keepUserMade(storage.get(KEYS.listings))]);
  storage.set(KEYS.conversations, [...buildConversations(now), ...keepUserMade(storage.get(KEYS.conversations))]);

  const favorites = storage.get(KEYS.favorites, {});
  if (!favorites[DEMO_USER_ID]) {
    storage.set(KEYS.favorites, { ...favorites, [DEMO_USER_ID]: DEMO_FAVORITES });
  }

  storage.set(KEYS.seedVersion, SEED_VERSION);
}
