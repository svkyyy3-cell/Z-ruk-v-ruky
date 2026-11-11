/**
 * Small helpers that make the localStorage-backed services behave like a
 * remote API (async, with latency and typed errors). Swapping a service for
 * real `fetch` calls later does not change any calling code.
 */
export class ApiError extends Error {
  constructor(message, { status = 400, field } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.field = field;
  }
}

export const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Run `fn` after a short, realistic delay. */
export async function simulate(fn, ms = 220) {
  await wait(ms);
  return fn();
}

export function createId(prefix = 'id') {
  const random =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `${prefix}-${Date.now().toString(36)}${random}`;
}

/** SHA-256 when available (secure contexts), otherwise a FNV-1a fallback. */
export async function hashPassword(password) {
  const salted = `zruky::${password}`;
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const data = new TextEncoder().encode(salted);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
  }
  let hash = 0x811c9dc5;
  for (let i = 0; i < salted.length; i += 1) {
    hash ^= salted.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return `fnv-${(hash >>> 0).toString(16)}`;
}
