import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { CATEGORIES } from '../data/categories';
import { useListings } from '../context/ListingsContext';
import { useDocumentTitle } from '../hooks';
import { pluralize } from '../utils/format';
import { Breadcrumbs } from '../components/ui/Display';

/** The attribute that acts as a sub-category (type, deal, field…). */
const MAIN_ATTRIBUTE = new Map(CATEGORIES.map((c) => [c.id, c.attributes.find((a) => a.filter === 'select')]));

export default function CategoriesPage() {
  useDocumentTitle('All categories');
  const { listings } = useListings();

  const stats = useMemo(() => {
    const map = new Map();
    listings
      .filter((l) => l.status === 'active')
      .forEach((l) => {
        const entry = map.get(l.category) ?? { count: 0, values: new Map() };
        entry.count += 1;
        const key = MAIN_ATTRIBUTE.get(l.category)?.key;
        const main = key && l.attributes?.[key];
        if (main) entry.values.set(main, (entry.values.get(main) ?? 0) + 1);
        map.set(l.category, entry);
      });
    return map;
  }, [listings]);

  return (
    <div className="container page">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Categories' }]} />
      <header className="page-head">
        <h1 className="page-title">All categories</h1>
        <p className="page-lead">Ten departments, thousands of things. Pick one to see its listings and dedicated filters.</p>
      </header>

      <ul className="cat-index">
        {CATEGORIES.map((category) => {
          const entry = stats.get(category.id);
          const attribute = MAIN_ATTRIBUTE.get(category.id);
          const top = [...(entry?.values ?? new Map()).entries()].sort((a, b) => b[1] - a[1]).slice(0, 4);
          return (
            <li key={category.id} className="cat-index__item card" style={{ '--tone': category.tone, '--ink-c': category.ink }}>
              <Link to={`/c/${category.slug}`} className="cat-index__head">
                <span className="cat-index__icon">
                  <category.icon size={26} aria-hidden="true" />
                </span>
                <span>
                  <span className="cat-index__name">{category.name}</span>
                  <span className="cat-index__count">{pluralize(entry?.count ?? 0, 'active listing')}</span>
                </span>
                <ArrowRight size={18} className="cat-index__arrow" aria-hidden="true" />
              </Link>
              <p className="cat-index__desc">{category.description}</p>
              {top.length > 0 && attribute && (
                <div className="cat-index__links">
                  {top.map(([value]) => (
                    <Link
                      key={value}
                      to={`/c/${category.slug}?${new URLSearchParams({ [`f_${attribute.key}`]: value })}`}
                      className="cat-index__link"
                    >
                      {value}
                    </Link>
                  ))}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
