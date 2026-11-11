import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowDownUp, SearchX, SlidersHorizontal } from 'lucide-react';
import { PAGE_SIZE, SORT_OPTIONS } from '../../config/site';
import { CATEGORIES } from '../../data/categories';
import { useListings } from '../../context/ListingsContext';
import { useFilterParams } from '../../hooks/useFilterParams';
import { applyFilters, countActiveFilters, matchesQuery } from '../../utils/filters';
import { formatNumber, pluralize } from '../../utils/format';
import { Button } from '../ui/Button';
import { Breadcrumbs, EmptyState } from '../ui/Display';
import { Select } from '../ui/Field';
import { Modal } from '../ui/Modal';
import { ActiveFilters } from './ActiveFilters';
import { FiltersPanel } from './FiltersPanel';
import { ListingGrid } from './ListingGrid';

/**
 * Shared results page for /search and /c/:slug. Everything is driven by URL
 * params so results are linkable and the back button restores state.
 */
export function ListingsBrowser({ category = null, title, description, breadcrumbs }) {
  const { listings, loading, error, reload } = useListings();
  const { params, filters, update, clearAll } = useFilterParams(category);
  const [sheetOpen, setSheetOpen] = useState(false);
  const paramsKey = params.toString();
  const [paging, setPaging] = useState({ key: paramsKey, visible: PAGE_SIZE });

  // Reset pagination whenever filters change.
  if (paging.key !== paramsKey) setPaging({ key: paramsKey, visible: PAGE_SIZE });

  const results = useMemo(
    () => applyFilters(listings, filters, { categoryId: category?.id }),
    [listings, filters, category],
  );

  const quickFilters = useQuickFilters({ listings, category, filters });
  const activeCount = countActiveFilters(filters);
  const visible = results.slice(0, paging.visible);
  const remaining = results.length - visible.length;

  const heading = filters.q ? `Results for “${filters.q}”` : title;

  return (
    <div className="container page browse-page">
      {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}

      <header className="browse-head">
        <div>
          <h1 className="browse-head__title">{heading}</h1>
          <p className="browse-head__meta">
            {loading ? 'Loading listings…' : `${pluralize(results.length, 'listing')}${filters.location ? ` in ${filters.location}` : ''}`}
            {filters.q && category && <> in {category.name}</>}
          </p>
          {description && !filters.q && <p className="browse-head__desc">{description}</p>}
        </div>
      </header>

      {quickFilters.items.length > 0 && (
        <nav className="quick" aria-label={category ? `${category.name} types` : 'Categories'}>
          {quickFilters.items.map((item) =>
            item.to ? (
              <Link key={item.label} to={item.to} className="quick__chip">
                {item.icon && <item.icon size={16} aria-hidden="true" />}
                {item.label}
                <span className="quick__count">{formatNumber(item.count)}</span>
              </Link>
            ) : (
              <button
                key={item.label}
                type="button"
                className={`quick__chip ${item.active ? 'is-active' : ''}`}
                aria-pressed={item.active}
                onClick={() => update({ [quickFilters.param]: item.value })}
              >
                {item.label}
                {item.count !== undefined && <span className="quick__count">{formatNumber(item.count)}</span>}
              </button>
            ),
          )}
        </nav>
      )}

      <div className="browse">
        <aside className="browse__sidebar" aria-label="Filters">
          <div className="browse__sidebar-inner card">
            <div className="browse__sidebar-head">
              <h2>Filters</h2>
              {activeCount > 0 && (
                <button type="button" className="text-link" onClick={clearAll}>
                  Clear all
                </button>
              )}
            </div>
            <FiltersPanel category={category} filters={filters} update={update} />
          </div>
        </aside>

        <section className="browse__results" aria-label="Results">
          <div className="toolbar">
            <Button
              variant="secondary"
              size="sm"
              icon={SlidersHorizontal}
              className="toolbar__filters"
              onClick={() => setSheetOpen(true)}
            >
              Filters{activeCount > 0 ? ` · ${activeCount}` : ''}
            </Button>
            <p className="toolbar__count">{loading ? '' : pluralize(results.length, 'result')}</p>
            <label className="toolbar__sort">
              <ArrowDownUp size={16} aria-hidden="true" />
              <span className="visually-hidden">Sort by</span>
              <Select
                value={filters.sort}
                onChange={(e) => update({ sort: e.target.value === 'newest' ? null : e.target.value })}
                options={SORT_OPTIONS}
              />
            </label>
          </div>

          <ActiveFilters category={category} filters={filters} update={update} clearAll={clearAll} />

          {error ? (
            <EmptyState
              icon={AlertTriangle}
              title="We couldn’t load listings"
              action={
                <Button variant="dark" onClick={reload}>
                  Try again
                </Button>
              }
            >
              Something went wrong while reading the catalogue. Please try again.
            </EmptyState>
          ) : loading ? (
            <ListingGrid loading columns={3} skeletonCount={9} />
          ) : results.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="Nothing matches your search"
              action={
                <>
                  {activeCount > 0 && (
                    <Button variant="dark" onClick={clearAll}>
                      Clear all filters
                    </Button>
                  )}
                  <Button variant="secondary" to="/post">
                    Post a wanted ad
                  </Button>
                </>
              }
            >
              Try fewer words, a wider price range or another city. New listings appear every minute.
            </EmptyState>
          ) : (
            <>
              <ListingGrid listings={visible} columns={3} />
              {remaining > 0 && (
                <div className="browse__more">
                  <p className="muted">
                    Showing {visible.length} of {results.length}
                  </p>
                  <Button variant="secondary" onClick={() => setPaging((p) => ({ ...p, visible: p.visible + PAGE_SIZE }))}>
                    Show {Math.min(PAGE_SIZE, remaining)} more
                  </Button>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      <Modal
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Filters"
        variant="sheet"
        footer={
          <>
            {activeCount > 0 && (
              <Button variant="ghost" onClick={clearAll}>
                Clear all
              </Button>
            )}
            <Button variant="dark" onClick={() => setSheetOpen(false)}>
              Show {pluralize(results.length, 'result')}
            </Button>
          </>
        }
      >
        <FiltersPanel category={category} filters={filters} update={update} />
      </Modal>
    </div>
  );
}

/**
 * On a category page: chips for the category's main attribute (e.g. phone /
 * laptop). On search: chips linking into each category with result counts.
 */
function useQuickFilters({ listings, category, filters }) {
  return useMemo(() => {
    const active = listings.filter((l) => l.status === 'active');
    if (category) {
      const attribute = category.attributes.find((a) => a.filter === 'select');
      if (!attribute) return { items: [] };
      const inCategory = active.filter((l) => l.category === category.id);
      const current = filters.attrs[attribute.key] ?? '';
      const options = attribute.options
        .map((option) => ({
          label: option,
          value: option,
          count: inCategory.filter((l) => l.attributes?.[attribute.key] === option).length,
          active: current === option,
        }))
        .filter((o) => o.count > 0);
      if (options.length < 2) return { items: [] };
      return {
        param: `f_${attribute.key}`,
        items: [{ label: 'All', value: null, count: inCategory.length, active: !current }, ...options],
      };
    }
    if (!filters.q) {
      return {
        items: CATEGORIES.map((c) => ({
          label: c.name,
          icon: c.icon,
          to: `/c/${c.slug}`,
          count: active.filter((l) => l.category === c.id).length,
        })),
      };
    }
    const qs = new URLSearchParams({ q: filters.q }).toString();
    return {
      items: CATEGORIES.map((c) => ({
        label: c.name,
        icon: c.icon,
        to: `/c/${c.slug}?${qs}`,
        count: active.filter((l) => l.category === c.id && matchesQuery(l, filters.q)).length,
      })).filter((i) => i.count > 0),
    };
  }, [listings, category, filters]);
}
