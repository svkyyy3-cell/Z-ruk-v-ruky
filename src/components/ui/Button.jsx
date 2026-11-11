import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { Spinner } from './Spinner';

/**
 * One button for every case: renders a <Link> when `to` is set, an <a> for
 * `href`, otherwise a <button>.
 * Variants: primary | dark | secondary | ghost | soft | danger
 */
export const Button = forwardRef(function Button(
  {
    to,
    href,
    variant = 'primary',
    size = 'md',
    icon: Icon,
    iconRight: IconRight,
    loading = false,
    block = false,
    className = '',
    children,
    type = 'button',
    disabled,
    ...rest
  },
  ref,
) {
  const classes = ['btn', `btn--${variant}`, `btn--${size}`, block && 'btn--block', className].filter(Boolean).join(' ');
  const iconSize = size === 'sm' ? 16 : 18;
  const content = (
    <>
      {loading ? <Spinner size={iconSize} /> : Icon && <Icon size={iconSize} aria-hidden="true" />}
      {children && <span>{children}</span>}
      {IconRight && !loading && <IconRight size={iconSize} aria-hidden="true" />}
    </>
  );

  if (to) {
    return (
      <Link ref={ref} to={to} className={classes} {...rest}>
        {content}
      </Link>
    );
  }
  if (href) {
    return (
      <a ref={ref} href={href} className={classes} {...rest}>
        {content}
      </a>
    );
  }
  return (
    <button ref={ref} type={type} className={classes} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
      {content}
    </button>
  );
});

export const IconButton = forwardRef(function IconButton(
  { icon: Icon, label, size = 'md', variant = 'ghost', badge, className = '', to, ...rest },
  ref,
) {
  const classes = ['icon-btn', `icon-btn--${variant}`, `icon-btn--${size}`, className].filter(Boolean).join(' ');
  const inner = (
    <>
      <Icon size={size === 'sm' ? 16 : 20} aria-hidden="true" />
      {badge ? <span className="icon-btn__badge">{badge > 99 ? '99+' : badge}</span> : null}
    </>
  );
  if (to) {
    return (
      <Link ref={ref} to={to} className={classes} aria-label={label} title={label} {...rest}>
        {inner}
      </Link>
    );
  }
  return (
    <button ref={ref} type="button" className={classes} aria-label={label} title={label} {...rest}>
      {inner}
    </button>
  );
});
