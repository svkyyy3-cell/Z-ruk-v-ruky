import { Link } from 'react-router-dom';
import { SITE } from '../../config/site';

/**
 * The mark is two hooked strokes passing an object from one hand to the
 * other — "from hand to hand". Coral gives, ink receives.
 */
export function LogoMark({ size = 34 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" className="logo__mark">
      <rect width="32" height="32" rx="9" fill="#FF5A36" />
      <path
        d="M9 12.5a5.5 5.5 0 0 1 5.5-5.5H23l-4 4h-4.5a1.5 1.5 0 0 0 0 3H17"
        fill="none"
        stroke="#fff"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M23 19.5a5.5 5.5 0 0 1-5.5 5.5H9l4-4h4.5a1.5 1.5 0 0 0 0-3H15"
        fill="none"
        stroke="#17181C"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo({ inverted = false, className = '' }) {
  return (
    <Link to="/" className={`logo ${inverted ? 'logo--inverted' : ''} ${className}`} aria-label={`${SITE.name} home`}>
      <LogoMark />
      <span className="logo__word">zruky</span>
    </Link>
  );
}
