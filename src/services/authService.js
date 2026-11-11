import { storage, KEYS } from './storage';
import { ApiError, createId, hashPassword, simulate } from './api';

/**
 * Authentication + account service backed by localStorage.
 * Replace the bodies with HTTP calls to integrate a real backend.
 */

const readUsers = () => storage.get(KEYS.users, []);
const writeUsers = (users) => storage.set(KEYS.users, users);

/** Data that is safe to show to anyone. */
export function toPublicUser(user) {
  if (!user) return null;
  // eslint-disable-next-line no-unused-vars
  const { passwordHash, email, origin, ...rest } = user;
  return { ...rest, canSignIn: Boolean(passwordHash) };
}

/** Data the signed-in user can see about themselves. */
function toSelf(user) {
  return { ...toPublicUser(user), email: user.email };
}

const normalizeEmail = (email) => email.trim().toLowerCase();

export const authService = {
  /** Returns the signed-in user or null (synchronous: used at boot). */
  getSessionUser() {
    const session = storage.get(KEYS.session);
    if (!session?.userId) return null;
    const user = readUsers().find((u) => u.id === session.userId);
    return user ? toSelf(user) : null;
  },

  listPublicUsers() {
    return readUsers().map(toPublicUser);
  },

  async register({ name, email, password, city }) {
    const passwordHash = await hashPassword(password);
    return simulate(() => {
      const users = readUsers();
      const normalized = normalizeEmail(email);
      if (users.some((u) => u.email && normalizeEmail(u.email) === normalized)) {
        throw new ApiError('An account with this email already exists.', { status: 409, field: 'email' });
      }
      const user = {
        id: createId('u'),
        name: name.trim(),
        email: normalized,
        passwordHash,
        phone: '',
        city,
        bio: '',
        createdAt: Date.now(),
        rating: null,
        reviewsCount: 0,
        responseTime: 'within a few hours',
        verified: false,
        business: false,
      };
      writeUsers([...users, user]);
      storage.set(KEYS.session, { userId: user.id, createdAt: Date.now() });
      return toSelf(user);
    }, 450);
  },

  async login({ email, password }) {
    const passwordHash = await hashPassword(password);
    return simulate(() => {
      const user = readUsers().find((u) => u.email && normalizeEmail(u.email) === normalizeEmail(email));
      if (!user || user.passwordHash !== passwordHash) {
        throw new ApiError('Incorrect email or password.', { status: 401 });
      }
      storage.set(KEYS.session, { userId: user.id, createdAt: Date.now() });
      return toSelf(user);
    }, 400);
  },

  async logout() {
    return simulate(() => storage.remove(KEYS.session), 120);
  },

  async updateProfile(userId, patch) {
    return simulate(() => {
      const users = readUsers();
      const index = users.findIndex((u) => u.id === userId);
      if (index === -1) throw new ApiError('Account not found.', { status: 404 });

      if (patch.email) {
        const normalized = normalizeEmail(patch.email);
        const taken = users.some((u) => u.id !== userId && u.email && normalizeEmail(u.email) === normalized);
        if (taken) throw new ApiError('This email is already used by another account.', { status: 409, field: 'email' });
        patch = { ...patch, email: normalized };
      }

      const allowed = ['name', 'email', 'phone', 'city', 'bio'];
      const clean = Object.fromEntries(Object.entries(patch).filter(([key]) => allowed.includes(key)));
      users[index] = { ...users[index], ...clean };
      writeUsers(users);
      return toSelf(users[index]);
    }, 350);
  },

  async changePassword(userId, currentPassword, nextPassword) {
    const [currentHash, nextHash] = await Promise.all([hashPassword(currentPassword), hashPassword(nextPassword)]);
    return simulate(() => {
      const users = readUsers();
      const user = users.find((u) => u.id === userId);
      if (!user) throw new ApiError('Account not found.', { status: 404 });
      if (user.passwordHash !== currentHash) {
        throw new ApiError('Current password is incorrect.', { status: 401, field: 'currentPassword' });
      }
      user.passwordHash = nextHash;
      writeUsers(users);
      return true;
    }, 350);
  },
};
