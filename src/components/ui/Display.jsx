import { Link } from 'react-router-dom';
import { BadgeCheck, ChevronRight, Star } from 'lucide-react';
import { colorFromString, initials } from '../../utils/format';

export function Avatar({ user, size = 40, className = '' }) {
  const name = user?.name ?? 'User';
  return (
    <span
      className={`avatar ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.38, background: colorFromString(user?.id ?? name) }}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
}

export function VerifiedMark({ size = 16 }) {
  return (
    <span className="verified" title="Verified seller">
      <BadgeCheck size={size} aria-hidden="true" />
      <span className="visually-hidden">Verified</span>
    </span>
  );
}

export function Rating({ value, count, size = 14 }) {
  if (!value) return <span className="rating rating--empty">New seller</span>;
  return (
    <span className="rating" aria-label={`Rated ${value} out of 5 from ${count} reviews`}>
      <span className="rating__stars" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((n) => (
          <Star
            key={n}
            size={size}
            className={n <= Math.round(value) ? 'is-filled' : ''}
            fill={n <= Math.round(value) ? 'currentColor' : 'none'}
          />
        ))}
      </span>
      <strong>{value.toFixed(1)}</strong>
      {count !== undefined && <span className="rating__count">({count})</span>}
    </span>
  );
}

export function Badge({ tone = 'neutral', icon: Icon, children, className = '' }) {
  return (
    <span className={`badge badge--${tone} ${className}`}>
      {Icon && <Icon size={12} aria-hidden="true" />}
      {children}
    </span>
  );
}

export function Breadcrumbs({ items }) {
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <ol>
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={item.label}>
              {last || !item.to ? (
                <span aria-current={last ? 'page' : undefined}>{item.label}</span>
              ) : (
                <Link to={item.to}>{item.label}</Link>
              )}
              {!last && <ChevronRight size={14} aria-hidden="true" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function EmptyState({ icon: Icon, title, children, action, compact = false, as: Heading = 'h3' }) {
  return (
    <div className={`empty ${compact ? 'empty--compact' : ''}`}>
      {Icon && (
        <span className="empty__icon">
          <Icon size={28} aria-hidden="true" />
        </span>
      )}
      <Heading className="empty__title">{title}</Heading>
      {children && <p className="empty__text">{children}</p>}
      {action && <div className="empty__action">{action}</div>}
    </div>
  );
}

export function SectionHeader({ title, subtitle, action, eyebrow }) {
  return (
    <div className="section-header">
      <div>
        {eyebrow && <p className="section-header__eyebrow">{eyebrow}</p>}
        <h2 className="section-header__title">{title}</h2>
        {subtitle && <p className="section-header__subtitle">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
