import { X } from 'lucide-react';
import { CONDITIONS } from '../../config/site';
import { formatMoney, formatNumber } from '../../utils/format';

function rangeLabel(min, max, format) {
  if (min !== null && max !== null) return `${format(min)} – ${format(max)}`;
  if (min !== null) return `from ${format(min)}`;
  return `up to ${format(max)}`;
}

/** Removable chips for each applied filter plus a "clear all" action. */
export function ActiveFilters({ category, filters, update, clearAll }) {
  const chips = [];

  if (filters.q) chips.push({ key: 'q', label: `“${filters.q}”`, clear: { q: null } });
  if (filters.location) chips.push({ key: 'location', label: filters.location, clear: { location: null } });
  if (filters.condition) {
    chips.push({
      key: 'condition',
      label: CONDITIONS.find((c) => c.value === filters.condition)?.label ?? filters.condition,
      clear: { condition: null },
    });
  }
  if (filters.minPrice !== null || filters.maxPrice !== null) {
    chips.push({
      key: 'price',
      label: rangeLabel(filters.minPrice, filters.maxPrice, formatMoney),
      clear: { min: null, max: null },
    });
  }
  category?.attributes.forEach((attribute) => {
    const value = filters.attrs[attribute.key];
    if (value === undefined) return;
    if (typeof value === 'object') {
      const unit = attribute.unit ? ` ${attribute.unit}` : '';
      const format = attribute.key === 'year' ? String : (n) => `${formatNumber(n)}${unit}`;
      chips.push({
        key: attribute.key,
        label: `${attribute.label}: ${rangeLabel(value.min, value.max, format)}`,
        clear: { [`f_${attribute.key}_min`]: null, [`f_${attribute.key}_max`]: null },
      });
    } else {
      chips.push({ key: attribute.key, label: `${attribute.label}: ${value}`, clear: { [`f_${attribute.key}`]: null } });
    }
  });

  if (!chips.length) return null;

  const filterCount = chips.filter((c) => c.key !== 'q').length;

  return (
    <div className="chips" aria-label="Applied filters">
      {chips.map((chip) => (
        <button key={chip.key} type="button" className="chip chip--removable" onClick={() => update(chip.clear)}>
          {chip.label}
          <X size={14} aria-label="Remove" />
        </button>
      ))}
      {filterCount > 0 && (
        <button type="button" className="chips__clear" onClick={clearAll}>
          Clear all filters
        </button>
      )}
    </div>
  );
}
