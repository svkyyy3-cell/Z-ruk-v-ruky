import { CURRENCY } from '../config/site';

const numberFormat = new Intl.NumberFormat(CURRENCY.locale);
const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export const formatNumber = (value) => numberFormat.format(value ?? 0);

export function formatMoney(amount) {
  return `${numberFormat.format(Math.round(amount))} ${CURRENCY.symbol}`;
}

/** Price label that respects free / exchange listings. */
export function formatPrice(listing) {
  if (!listing) return '';
  if (listing.priceType === 'free') return 'Free';
  if (listing.priceType === 'exchange') return 'Exchange';
  return formatMoney(listing.price);
}

/** Small suffix shown next to prices (per month, negotiable…). */
export function priceNote(listing) {
  const notes = [];
  if (listing.category === 'jobs') notes.push('per month');
  if (listing.category === 'real-estate' && listing.attributes?.deal === 'Rent') notes.push('per month');
  if (listing.category === 'services') notes.unshift('from');
  if (listing.priceType === 'negotiable') notes.push('negotiable');
  return notes.join(' · ');
}

const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const timeFormat = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' });
const dayMonth = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' });
const fullDate = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
const monthYear = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' });

/** "Just now", "12 min ago", "Today, 14:20", "Yesterday, 09:10", "12 Oct". */
export function formatRelative(timestamp, now = Date.now()) {
  const diff = now - timestamp;
  const date = new Date(timestamp);
  const today = new Date(now);
  if (diff < MINUTE) return 'Just now';
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)} min ago`;
  if (isSameDay(date, today)) return `Today, ${timeFormat.format(date)}`;
  const yesterday = new Date(now - DAY);
  if (isSameDay(date, yesterday)) return `Yesterday, ${timeFormat.format(date)}`;
  if (diff < 7 * DAY) return `${Math.round(diff / DAY)} days ago`;
  return dayMonth.format(date);
}

export const formatDate = (timestamp) => fullDate.format(new Date(timestamp));
export const formatMonthYear = (timestamp) => monthYear.format(new Date(timestamp));
export const formatTime = (timestamp) => timeFormat.format(new Date(timestamp));

/** Short time for chat lists: 14:20 / Yesterday / 12 Oct. */
export function formatChatTime(timestamp, now = Date.now()) {
  const date = new Date(timestamp);
  if (isSameDay(date, new Date(now))) return timeFormat.format(date);
  if (isSameDay(date, new Date(now - DAY))) return 'Yesterday';
  return dayMonth.format(date);
}

export function initials(name = '') {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

export const pluralize = (count, singular, plural = `${singular}s`) =>
  `${formatNumber(count)} ${count === 1 ? singular : plural}`;

/** Formats an attribute value with its unit (e.g. "48,000 km"). */
export function formatAttribute(attribute, value) {
  if (value === undefined || value === null || value === '') return null;
  if (attribute.type === 'number') {
    if (attribute.key === 'ageMonths') {
      const months = Number(value);
      if (months >= 24 && months % 12 === 0) return pluralize(months / 12, 'year');
      return pluralize(months, 'month');
    }
    if (attribute.key === 'year') return String(value);
    return `${formatNumber(Number(value))}${attribute.unit ? ` ${attribute.unit}` : ''}`;
  }
  return String(value);
}

/** Deterministic pastel colour for avatars. */
export function colorFromString(input = '') {
  const palette = ['#FF5A36', '#2944B8', '#1E6B41', '#A12B62', '#8A5A00', '#1A6A78', '#5B3CC4', '#334155'];
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) hash = (hash * 31 + input.charCodeAt(i)) | 0;
  return palette[Math.abs(hash) % palette.length];
}
