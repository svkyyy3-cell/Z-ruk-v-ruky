import { Link, NavLink } from 'react-router-dom';
import { ChevronDown, Mail } from 'lucide-react';
import { INFO_PAGES } from '../data/pages';
import { SITE } from '../config/site';
import { useDocumentTitle } from '../hooks';
import { Breadcrumbs } from '../components/ui/Display';
import { Button } from '../components/ui/Button';

const NAV = [
  ['help', 'Help centre'],
  ['safety', 'Safety tips'],
  ['rules', 'Posting rules'],
  ['business', 'For business'],
  ['about', 'About'],
  ['terms', 'Terms'],
  ['privacy', 'Privacy'],
];

export default function InfoPage({ slug }) {
  const page = INFO_PAGES[slug];
  useDocumentTitle(page.title);

  return (
    <div className="container page info">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: page.title }]} />
      <div className="info__layout">
        <nav className="info__nav" aria-label="Information pages">
          {NAV.map(([to, label]) => (
            <NavLink key={to} to={`/${to}`} className="info__link">
              {label}
            </NavLink>
          ))}
        </nav>

        <article className="info__article">
          <header className="page-head">
            <h1 className="page-title">{page.title}</h1>
            <p className="page-lead">{page.lead}</p>
          </header>

          {page.faq && (
            <div className="faq">
              {page.faq.map((item) => (
                <details key={item.q} className="faq__item card">
                  <summary>
                    {item.q}
                    <ChevronDown size={18} aria-hidden="true" />
                  </summary>
                  <p>{item.a}</p>
                </details>
              ))}
            </div>
          )}

          {page.sections.map((section) => (
            <section key={section.heading} className="info__section">
              <h2>{section.heading}</h2>
              {section.body.map((paragraph) => (
                <p key={paragraph.slice(0, 32)}>{paragraph}</p>
              ))}
            </section>
          ))}

          <div className="info__cta card">
            <div>
              <h2>Ready to give something a second life?</h2>
              <p className="muted">Posting is free and takes about two minutes.</p>
            </div>
            <div className="info__cta-actions">
              <Button to="/post">Post an ad</Button>
              <Button variant="secondary" href={`mailto:${SITE.supportEmail}`} icon={Mail}>
                Contact us
              </Button>
            </div>
          </div>
          <p className="info__back">
            <Link to="/" className="text-link">
              ← Back to the marketplace
            </Link>
          </p>
        </article>
      </div>
    </div>
  );
}
