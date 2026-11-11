import { Link } from 'react-router-dom';
import { Mail, Phone, ShieldCheck } from 'lucide-react';
import { CATEGORIES } from '../../data/categories';
import { SITE } from '../../config/site';
import { Logo } from '../brand/Logo';

const COLUMNS = [
  {
    title: 'Marketplace',
    links: [
      { to: '/search?sort=newest', label: 'Newest listings' },
      { to: '/categories', label: 'All categories' },
      { to: '/post', label: 'Post an ad' },
      { to: '/favorites', label: 'Favorites' },
    ],
  },
  {
    title: 'Help',
    links: [
      { to: '/help', label: 'Help centre' },
      { to: '/safety', label: 'Safety tips' },
      { to: '/rules', label: 'Posting rules' },
      { to: '/business', label: 'For business' },
    ],
  },
  {
    title: 'Company',
    links: [
      { to: '/about', label: 'About Zruky' },
      { to: '/terms', label: 'Terms of use' },
      { to: '/privacy', label: 'Privacy policy' },
    ],
  },
];

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__top">
          <div className="footer__brand">
            <Logo inverted />
            <p className="footer__claim">
              {SITE.tagline}. A friendlier way to buy and sell anything — from phones to flats — with people nearby.
            </p>
            <div className="footer__contact">
              <a href={`mailto:${SITE.supportEmail}`}>
                <Mail size={16} aria-hidden="true" /> {SITE.supportEmail}
              </a>
              <a href={`tel:${SITE.supportPhone.replace(/\s/g, '')}`}>
                <Phone size={16} aria-hidden="true" /> {SITE.supportPhone}
              </a>
            </div>
          </div>

          <div className="footer__cols">
            {COLUMNS.map((column) => (
              <div key={column.title} className="footer__col">
                <h3>{column.title}</h3>
                <ul>
                  {column.links.map((link) => (
                    <li key={link.to}>
                      <Link to={link.to}>{link.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div className="footer__col">
              <h3>Categories</h3>
              <ul>
                {CATEGORIES.slice(0, 6).map((category) => (
                  <li key={category.id}>
                    <Link to={`/c/${category.slug}`}>{category.name}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="footer__safety">
          <ShieldCheck size={20} aria-hidden="true" />
          <p>
            Never send prepayments to people you haven’t met. Meet in public places and check items before paying.{' '}
            <Link to="/safety">Read safety tips</Link>
          </p>
        </div>

        <div className="footer__bottom">
          <p>
            © {year} {SITE.name}. Made with care in {SITE.country}.
          </p>
          <div className="footer__legal">
            <Link to="/terms">Terms</Link>
            <Link to="/privacy">Privacy</Link>
            <Link to="/help">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
