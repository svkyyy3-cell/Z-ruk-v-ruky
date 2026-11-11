import { forwardRef, useId } from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * Accessible form field wrapper: label, hint, error and optional counter.
 * Children receive an id via render-prop so labels stay connected.
 */
export function Field({ label, hint, error, counter, required, optional, className = '', children }) {
  const id = useId();
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined;
  return (
    <div className={`field ${error ? 'field--error' : ''} ${className}`}>
      {label && (
        <div className="field__top">
          <label className="field__label" htmlFor={id}>
            {label}
            {required && <span className="field__required" aria-hidden="true"> *</span>}
            {optional && <span className="field__optional"> (optional)</span>}
          </label>
          {counter && <span className="field__counter">{counter}</span>}
        </div>
      )}
      {children({ id, 'aria-describedby': describedBy, 'aria-invalid': error ? true : undefined })}
      {error ? (
        <p className="field__error" id={`${id}-error`} role="alert">
          {error}
        </p>
      ) : (
        hint && (
          <p className="field__hint" id={`${id}-hint`}>
            {hint}
          </p>
        )
      )}
    </div>
  );
}

export const Input = forwardRef(function Input({ icon: Icon, suffix, className = '', ...props }, ref) {
  return (
    <div className={`input ${Icon ? 'input--icon' : ''} ${suffix ? 'input--suffix' : ''} ${className}`}>
      {Icon && <Icon className="input__icon" size={18} aria-hidden="true" />}
      <input ref={ref} className="input__control" {...props} />
      {suffix && <span className="input__suffix">{suffix}</span>}
    </div>
  );
});

export const Textarea = forwardRef(function Textarea({ className = '', ...props }, ref) {
  return <textarea ref={ref} className={`textarea ${className}`} {...props} />;
});

export const Select = forwardRef(function Select({ options, placeholder, className = '', ...props }, ref) {
  return (
    <div className={`select ${className}`}>
      <select ref={ref} className="select__control" {...props}>
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((option) => {
          const value = typeof option === 'string' ? option : option.value;
          const label = typeof option === 'string' ? option : option.label;
          return (
            <option key={value} value={value}>
              {label}
            </option>
          );
        })}
      </select>
      <ChevronDown className="select__chevron" size={16} aria-hidden="true" />
    </div>
  );
});

/** Pill-style radio group (condition, price type, tabs). */
export function Segmented({ name, value, onChange, options, size = 'md', ...rest }) {
  return (
    <div className={`segmented segmented--${size}`} role="radiogroup" {...rest}>
      {options.map((option) => (
        <label key={option.value} className={`segmented__item ${value === option.value ? 'is-active' : ''}`}>
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
          />
          {option.icon && <option.icon size={16} aria-hidden="true" />}
          <span>{option.label}</span>
        </label>
      ))}
    </div>
  );
}

export function Checkbox({ label, className = '', ...props }) {
  return (
    <label className={`checkbox ${className}`}>
      <input type="checkbox" {...props} />
      <span className="checkbox__box" aria-hidden="true" />
      <span className="checkbox__label">{label}</span>
    </label>
  );
}
