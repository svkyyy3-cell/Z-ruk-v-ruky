import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CATEGORIES } from '../../data/categories';
import { CONDITIONS, CURRENCY, LOCATIONS } from '../../config/site';
import { isAttributeParam } from '../../utils/filters';
import { Select, Segmented } from '../ui/Field';

/**
 * Two number inputs that commit on blur / Enter. Keyed by the committed
 * values so they reset when filters are cleared elsewhere.
 */
function RangeInputs({ label, min, max, onCommit, unit, minName, maxName }) {
  const [draft, setDraft] = useState({ min: min ?? '', max: max ?? '' });

  const commit = () => {
    let low = draft.min === '' ? null : Math.max(0, Number(draft.min));
    let high = draft.max === '' ? null : Math.max(0, Number(draft.max));
    if (low !== null && high !== null && low > high) [low, high] = [high, low];
    if (low !== min || high !== max) onCommit(low, high);
  };

  const onKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      commit();
    }
  };

  return (
    <fieldset className="filters__group">
      <legend className="filters__label">{label}</legend>
      <div className="range">
        <label className="range__field">
          <span className="visually-hidden">Minimum {label}</span>
          <input
            type="number"
            inputMode="numeric"
            min="0"
            name={minName}
            placeholder="From"
            value={draft.min}
            onChange={(e) => setDraft((d) => ({ ...d, min: e.target.value }))}
            onBlur={commit}
            onKeyDown={onKeyDown}
          />
          {unit && <span>{unit}</span>}
        </label>
        <span className="range__dash" aria-hidden="true">
          –
        </span>
        <label className="range__field">
          <span className="visually-hidden">Maximum {label}</span>
          <input
            type="number"
            inputMode="numeric"
            min="0"
            name={maxName}
            placeholder="To"
            value={draft.max}
            onChange={(e) => setDraft((d) => ({ ...d, max: e.target.value }))}
            onBlur={commit}
            onKeyDown={onKeyDown}
          />
          {unit && <span>{unit}</span>}
        </label>
      </div>
    </fieldset>
  );
}

export function FiltersPanel({ category, filters, update }) {
  const navigate = useNavigate();
  const { search } = useLocation();

  const changeCategory = (slug) => {
    const params = new URLSearchParams(search);
    [...params.keys()].filter(isAttributeParam).forEach((key) => params.delete(key));
    const target = getConditionAware(slug, params);
    const qs = target.toString();
    navigate(`${slug ? `/c/${slug}` : '/search'}${qs ? `?${qs}` : ''}`, { preventScrollReset: true });
  };

  const showCondition = !category || category.hasCondition;

  return (
    <div className="filters">
      <div className="filters__group">
        <label className="filters__label" htmlFor="filter-category">
          Category
        </label>
        <Select
          id="filter-category"
          value={category?.slug ?? ''}
          onChange={(e) => changeCategory(e.target.value)}
          placeholder="All categories"
          options={CATEGORIES.map((c) => ({ value: c.slug, label: c.name }))}
        />
      </div>

      <RangeInputs
        key={`price-${filters.minPrice}-${filters.maxPrice}`}
        label={category?.priceLabel ?? 'Price'}
        unit={CURRENCY.symbol}
        min={filters.minPrice}
        max={filters.maxPrice}
        minName="min"
        maxName="max"
        onCommit={(min, max) => update({ min, max })}
      />

      <div className="filters__group">
        <label className="filters__label" htmlFor="filter-location">
          Location
        </label>
        <Select
          id="filter-location"
          value={filters.location}
          onChange={(e) => update({ location: e.target.value })}
          placeholder="All cities"
          options={LOCATIONS}
        />
      </div>

      {showCondition && (
        <fieldset className="filters__group">
          <legend className="filters__label">Condition</legend>
          <Segmented
            name="condition"
            size="sm"
            value={filters.condition}
            onChange={(value) => update({ condition: value })}
            options={[{ value: '', label: 'Any' }, ...CONDITIONS]}
          />
        </fieldset>
      )}

      {category && (
        <div className="filters__specific">
          <p className="filters__heading">{category.name} filters</p>
          {category.attributes.map((attribute) =>
            attribute.filter === 'range' ? (
              <RangeInputs
                key={`${attribute.key}-${filters.attrs[attribute.key]?.min}-${filters.attrs[attribute.key]?.max}`}
                label={attribute.label}
                unit={attribute.unit}
                min={filters.attrs[attribute.key]?.min ?? null}
                max={filters.attrs[attribute.key]?.max ?? null}
                minName={`f_${attribute.key}_min`}
                maxName={`f_${attribute.key}_max`}
                onCommit={(min, max) => update({ [`f_${attribute.key}_min`]: min, [`f_${attribute.key}_max`]: max })}
              />
            ) : (
              <div className="filters__group" key={attribute.key}>
                <label className="filters__label" htmlFor={`filter-${attribute.key}`}>
                  {attribute.label}
                </label>
                <Select
                  id={`filter-${attribute.key}`}
                  value={filters.attrs[attribute.key] ?? ''}
                  onChange={(e) => update({ [`f_${attribute.key}`]: e.target.value })}
                  placeholder="Any"
                  options={attribute.options}
                />
              </div>
            ),
          )}
        </div>
      )}
    </div>
  );
}

/** Condition is meaningless for some categories (jobs, real estate…). */
function getConditionAware(slug, params) {
  const target = CATEGORIES.find((c) => c.slug === slug);
  if (target && !target.hasCondition) params.delete('condition');
  return params;
}
