import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Check, MapPin, Navigation, Search } from 'lucide-react';
import { LOCATIONS, SITE } from '../../config/site';
import { usePreferences } from '../../context/PreferencesContext';
import { useListings } from '../../context/ListingsContext';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Field';
import { formatNumber } from '../../utils/format';

export function LocationDialog({ open, onClose, value, onSelect }) {
  const [query, setQuery] = useState('');
  const { listings } = useListings();

  const counts = useMemo(() => {
    const map = new Map();
    listings.forEach((l) => l.status === 'active' && map.set(l.location, (map.get(l.location) ?? 0) + 1));
    return map;
  }, [listings]);

  const cities = LOCATIONS.filter((city) => city.toLowerCase().includes(query.trim().toLowerCase()));

  const choose = (city) => {
    onSelect(city);
    setQuery('');
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Choose your city" description="We’ll show listings near you first." variant="sheet">
      <Input icon={Search} placeholder="Search city" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search city" />
      <ul className="city-list">
        {!query && (
          <li>
            <button type="button" className={`city-option ${!value ? 'is-active' : ''}`} onClick={() => choose('')}>
              <Navigation size={16} aria-hidden="true" />
              <span>All of {SITE.country}</span>
              {!value && <Check size={16} className="city-option__check" aria-hidden="true" />}
            </button>
          </li>
        )}
        {cities.map((city) => (
          <li key={city}>
            <button type="button" className={`city-option ${value === city ? 'is-active' : ''}`} onClick={() => choose(city)}>
              <MapPin size={16} aria-hidden="true" />
              <span>{city}</span>
              <span className="city-option__count">{formatNumber(counts.get(city) ?? 0)}</span>
              {value === city && <Check size={16} className="city-option__check" aria-hidden="true" />}
            </button>
          </li>
        ))}
        {!cities.length && <li className="city-list__empty">No cities match “{query}”.</li>}
      </ul>
    </Modal>
  );
}

const BROWSE_PATH = /^\/(search|c\/)/;

/**
 * Header location control. Stores the preferred city and, on results pages,
 * applies it to the current search immediately.
 */
export function LocationButton({ className = '', compact = false }) {
  const [open, setOpen] = useState(false);
  const { location: city, setLocation } = usePreferences();
  const routerLocation = useLocation();
  const navigate = useNavigate();

  const select = (next) => {
    setLocation(next);
    if (BROWSE_PATH.test(routerLocation.pathname)) {
      const params = new URLSearchParams(routerLocation.search);
      if (next) params.set('location', next);
      else params.delete('location');
      navigate({ pathname: routerLocation.pathname, search: params.toString() }, { preventScrollReset: true });
    }
  };

  return (
    <>
      <button
        type="button"
        className={`location-btn ${compact ? 'location-btn--compact' : ''} ${className}`}
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-label={`Location: ${city || `All of ${SITE.country}`}. Change location`}
      >
        <MapPin size={16} aria-hidden="true" />
        <span>{city || `All ${SITE.country}`}</span>
      </button>
      <LocationDialog open={open} onClose={() => setOpen(false)} value={city} onSelect={select} />
    </>
  );
}
