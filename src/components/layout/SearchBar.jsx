import { useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowUpRight, Clock, Search, TrendingUp, X } from 'lucide-react';
import { CATEGORIES, getCategoryBySlug } from '../../data/categories';
import { useListings } from '../../context/ListingsContext';
import { usePreferences } from '../../context/PreferencesContext';
import { matchesQuery } from '../../utils/filters';
import { formatPrice } from '../../utils/format';
import { resolveImage } from '../../utils/images';
import { LocationButton } from './LocationPicker';

const POPULAR = ['iPhone', 'Sofa', 'BMW', 'Apartment rent', 'PS5', 'Puppy'];

/** Reads q / category from the current results URL so the bar mirrors it. */
function useRouteSearch() {
  const { pathname, search } = useLocation();
  const params = new URLSearchParams(search);
  const categoryMatch = pathname.match(/^\/c\/([^/]+)/);
  return {
    key: pathname + search,
    q: pathname === '/search' || categoryMatch ? (params.get('q') ?? '') : '',
    category: categoryMatch && getCategoryBySlug(categoryMatch[1]) ? categoryMatch[1] : '',
  };
}

export function SearchBar({ className = '' }) {
  const navigate = useNavigate();
  const route = useRouteSearch();
  const { listings } = useListings();
  const { location, recentSearches, addRecentSearch, clearRecentSearches } = usePreferences();

  const [query, setQuery] = useState(route.q);
  const [category, setCategory] = useState(route.category);
  const [routeKey, setRouteKey] = useState(route.key);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const inputRef = useRef(null);

  // Mirror the URL when the user navigates (back button, links, filters).
  if (routeKey !== route.key) {
    setRouteKey(route.key);
    setQuery(route.q);
    setCategory(route.category);
  }

  const items = useMemo(() => {
    const term = query.trim();
    if (!term) {
      const recent = recentSearches.map((text) => ({ kind: 'recent', text }));
      const popular = POPULAR.filter((p) => !recentSearches.includes(p)).map((text) => ({ kind: 'popular', text }));
      return [...recent, ...popular].slice(0, 8);
    }
    const lower = term.toLowerCase();
    const categories = CATEGORIES.filter((c) => c.name.toLowerCase().includes(lower))
      .slice(0, 2)
      .map((c) => ({ kind: 'category', category: c }));
    const matches = listings
      .filter((l) => l.status === 'active' && (!category || l.category === category) && matchesQuery(l, term))
      .sort((a, b) => (b.views ?? 0) - (a.views ?? 0))
      .slice(0, 5)
      .map((listing) => ({ kind: 'listing', listing }));
    return [{ kind: 'query', text: term }, ...categories, ...matches];
  }, [query, category, listings, recentSearches]);

  const runSearch = (text) => {
    const term = text.trim();
    const params = new URLSearchParams();
    if (term) params.set('q', term);
    if (location) params.set('location', location);
    addRecentSearch(term);
    setOpen(false);
    inputRef.current?.blur();
    const qs = params.toString();
    navigate(category ? `/c/${category}${qs ? `?${qs}` : ''}` : `/search${qs ? `?${qs}` : ''}`);
  };

  const choose = (item) => {
    setOpen(false);
    inputRef.current?.blur();
    if (item.kind === 'listing') navigate(`/listing/${item.listing.id}`);
    else if (item.kind === 'category') navigate(`/c/${item.category.slug}`);
    else {
      setQuery(item.text);
      runSearch(item.text);
    }
  };

  const onKeyDown = (event) => {
    if (!open && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) setOpen(true);
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActive((i) => (i + 1) % items.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((i) => (i <= 0 ? items.length - 1 : i - 1));
    } else if (event.key === 'Escape' && open) {
      event.preventDefault();
      setOpen(false);
    } else if (event.key === 'Enter' && open && active >= 0 && items[active]) {
      event.preventDefault();
      choose(items[active]);
    }
  };

  const showRecentHeader = !query.trim() && items.some((i) => i.kind === 'recent');

  return (
    <form
      className={`searchbar ${open ? 'is-open' : ''} ${className}`}
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        runSearch(query);
      }}
    >
      <label className="searchbar__category">
        <span className="visually-hidden">Category</span>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </label>

      <div className="searchbar__field">
        <Search className="searchbar__icon" size={18} aria-hidden="true" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          placeholder={category ? `Search in ${getCategoryBySlug(category)?.name}` : 'What are you looking for?'}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(-1);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onKeyDown={onKeyDown}
          aria-label="Search listings"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls="search-suggestions"
          autoComplete="off"
          enterKeyHint="search"
        />
        {query && (
          <button
            type="button"
            className="searchbar__clear"
            aria-label="Clear search"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
          >
            <X size={16} />
          </button>
        )}
      </div>

      <LocationButton className="searchbar__location" />

      <button type="submit" className="searchbar__submit">
        <Search size={18} aria-hidden="true" />
        <span>Search</span>
      </button>

      {open && items.length > 0 && (
        <div className="suggestions" id="search-suggestions" role="listbox" onMouseDown={(e) => e.preventDefault()}>
          {showRecentHeader && (
            <div className="suggestions__head">
              <span>Recent searches</span>
              <button type="button" onClick={clearRecentSearches}>
                Clear
              </button>
            </div>
          )}
          {!query.trim() && !showRecentHeader && <div className="suggestions__head">Popular right now</div>}
          {items.map((item, index) => (
            <button
              type="button"
              role="option"
              aria-selected={index === active}
              key={`${item.kind}-${item.text ?? item.category?.slug ?? item.listing?.id}`}
              className={`suggestion ${index === active ? 'is-active' : ''}`}
              onMouseEnter={() => setActive(index)}
              onClick={() => choose(item)}
            >
              <SuggestionContent item={item} />
            </button>
          ))}
        </div>
      )}
    </form>
  );
}

function SuggestionContent({ item }) {
  if (item.kind === 'listing') {
    const { listing } = item;
    return (
      <>
        <img className="suggestion__thumb" src={resolveImage(listing.images[0], { w: 80, h: 80 })} alt="" loading="lazy" />
        <span className="suggestion__text">{listing.title}</span>
        <span className="suggestion__meta">{formatPrice(listing)}</span>
      </>
    );
  }
  if (item.kind === 'category') {
    const Icon = item.category.icon;
    return (
      <>
        <span className="suggestion__icon" style={{ background: item.category.tone, color: item.category.ink }}>
          <Icon size={16} aria-hidden="true" />
        </span>
        <span className="suggestion__text">
          Browse <strong>{item.category.name}</strong>
        </span>
        <ArrowUpRight size={16} className="suggestion__meta" aria-hidden="true" />
      </>
    );
  }
  const Icon = item.kind === 'recent' ? Clock : item.kind === 'popular' ? TrendingUp : Search;
  return (
    <>
      <span className="suggestion__icon">
        <Icon size={16} aria-hidden="true" />
      </span>
      <span className="suggestion__text">
        {item.kind === 'query' ? (
          <>
            Search for “<strong>{item.text}</strong>”
          </>
        ) : (
          item.text
        )}
      </span>
    </>
  );
}
