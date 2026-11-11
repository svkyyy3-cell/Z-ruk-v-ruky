import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Circle, Eye, History, Send } from 'lucide-react';
import { CATEGORIES, getCategoryById } from '../../data/categories';
import { CONDITIONS, CURRENCY, LISTING_LIMITS, LOCATIONS, PRICE_TYPES } from '../../config/site';
import { useAuth } from '../../context/AuthContext';
import { storage, KEYS } from '../../services/storage';
import { validateListing } from '../../utils/validation';
import { Button } from '../ui/Button';
import { Field, Input, Segmented, Select, Textarea } from '../ui/Field';
import { Modal } from '../ui/Modal';
import { ImageUploader } from './ImageUploader';
import { ListingPreview, PreviewCard } from './ListingPreview';

export const EMPTY_LISTING = {
  title: '',
  category: '',
  price: '',
  priceType: 'fixed',
  condition: '',
  description: '',
  location: '',
  images: [],
  attributes: {},
};

/** Normalises form values into the payload the service expects. */
function toPayload(values) {
  const category = getCategoryById(values.category);
  const attributes = {};
  category?.attributes.forEach((attribute) => {
    const raw = values.attributes[attribute.key];
    if (raw === undefined || raw === '') return;
    attributes[attribute.key] = attribute.type === 'number' ? Number(raw) : raw;
  });
  return {
    title: values.title.trim(),
    category: values.category,
    price: values.priceType === 'free' ? 0 : Number(values.price) || 0,
    priceType: values.priceType,
    condition: category?.hasCondition ? values.condition : null,
    description: values.description.trim(),
    location: values.location,
    images: values.images,
    attributes,
  };
}

function qualityChecks(values) {
  return [
    { label: 'Specific title', done: values.title.trim().length >= 20 },
    { label: 'At least 3 photos', done: values.images.length >= 3 },
    { label: 'Detailed description (120+ chars)', done: values.description.trim().length >= 120 },
    { label: 'Price set', done: values.priceType === 'free' || values.priceType === 'exchange' || Number(values.price) > 0 },
    { label: 'Category details filled', done: Object.values(values.attributes).some((v) => v !== '' && v !== undefined) },
  ];
}

function readDraft() {
  const draft = storage.get(KEYS.draft);
  if (!draft || typeof draft !== 'object') return null;
  const hasContent = draft.title || draft.description || draft.category || draft.price;
  return hasContent ? { ...EMPTY_LISTING, ...draft } : null;
}

/**
 * Shared create / edit form.
 * `onSubmit(payload)` must return a promise; errors are displayed inline.
 */
export function ListingForm({ initialValues, onSubmit, submitLabel = 'Publish', useDraft = false, cancelTo }) {
  const { user } = useAuth();
  const [restoredDraft] = useState(() => (useDraft ? readDraft() : null));
  const [values, setValues] = useState(
    () => restoredDraft ?? initialValues ?? { ...EMPTY_LISTING, location: user?.city && LOCATIONS.includes(user.city) ? user.city : '' },
  );
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [draftNotice, setDraftNotice] = useState(Boolean(restoredDraft));

  const category = getCategoryById(values.category);
  const { errors } = useMemo(() => validateListing(values), [values]);
  const visibleError = (field) => (submitted || touched[field] ? errors[field] : undefined);
  const checks = qualityChecks(values);
  const score = checks.filter((c) => c.done).length;

  // Autosave text fields of new listings. Photos are left out on purpose so
  // drafts never eat the storage budget that real listings need.
  useEffect(() => {
    if (!useDraft) return undefined;
    const timer = setTimeout(() => {
      try {
        const { images, ...rest } = values;
        storage.set(KEYS.draft, { ...rest, images: [], imageCount: images.length });
      } catch {
        /* best effort */
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [values, useDraft]);

  const set = (field, value) => setValues((v) => ({ ...v, [field]: value }));
  const touch = (field) => setTouched((t) => (t[field] ? t : { ...t, [field]: true }));
  const setAttribute = (key, value) => setValues((v) => ({ ...v, attributes: { ...v.attributes, [key]: value } }));

  const chooseCategory = (slug) => {
    const next = getCategoryById(slug);
    setValues((v) => ({
      ...v,
      category: slug,
      attributes: {},
      condition: next?.hasCondition ? v.condition : '',
    }));
    touch('category');
  };

  const discardDraft = () => {
    storage.remove(KEYS.draft);
    setValues({ ...EMPTY_LISTING, location: user?.city && LOCATIONS.includes(user.city) ? user.city : '' });
    setTouched({});
    setSubmitted(false);
    setDraftNotice(false);
  };

  const submit = async (event) => {
    event?.preventDefault();
    setSubmitted(true);
    setServerError('');
    const result = validateListing(values);
    if (!result.valid) {
      setPreviewOpen(false);
      requestAnimationFrame(() => {
        const first = document.querySelector('.field--error, .uploader__drop.has-error, .catpick.has-error');
        first?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        first?.querySelector('input, select, textarea, button')?.focus({ preventScroll: true });
      });
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit(toPayload(values));
      if (useDraft) storage.remove(KEYS.draft);
    } catch (error) {
      setServerError(error.message || 'Something went wrong. Please try again.');
      setSubmitting(false);
      setPreviewOpen(false);
    }
  };

  const errorCount = Object.keys(errors).length;
  const priceless = values.priceType === 'free' || values.priceType === 'exchange';

  return (
    <form className="lform" onSubmit={submit} noValidate>
      <div className="lform__main">
        {draftNotice && (
          <div className="lform__notice" role="status">
            <History size={18} aria-hidden="true" />
            <p>
              We restored your unsaved draft.
              {restoredDraft?.imageCount > 0 && ' Photos aren’t saved in drafts, so please add them again.'}
            </p>
            <button type="button" className="text-link" onClick={discardDraft}>
              Start over
            </button>
          </div>
        )}

        <section className="lform__card card" aria-labelledby="sec-basics">
          <header className="lform__head">
            <span className="lform__step">1</span>
            <div>
              <h2 id="sec-basics">What are you selling?</h2>
              <p>A clear title and the right category help buyers find you.</p>
            </div>
          </header>

          <Field
            label="Title"
            required
            error={visibleError('title')}
            hint="e.g. “iPhone 13, 128 GB, blue, battery 92%”"
            counter={`${values.title.length}/${LISTING_LIMITS.titleMax}`}
          >
            {(props) => (
              <Input
                {...props}
                value={values.title}
                maxLength={LISTING_LIMITS.titleMax}
                onChange={(e) => set('title', e.target.value)}
                onBlur={() => touch('title')}
                placeholder="What exactly are you offering?"
              />
            )}
          </Field>

          <fieldset className={`catpick ${visibleError('category') ? 'has-error' : ''}`}>
            <legend className="field__label">
              Category <span className="field__required">*</span>
            </legend>
            <div className="catpick__grid">
              {CATEGORIES.map((c) => (
                <label key={c.id} className={`catpick__item ${values.category === c.id ? 'is-active' : ''}`} style={{ '--tone': c.tone, '--ink-c': c.ink }}>
                  <input type="radio" name="category" value={c.id} checked={values.category === c.id} onChange={() => chooseCategory(c.id)} />
                  <span className="catpick__icon">
                    <c.icon size={20} aria-hidden="true" />
                  </span>
                  <span>{c.name}</span>
                </label>
              ))}
            </div>
            {visibleError('category') && (
              <p className="field__error" role="alert">
                {errors.category}
              </p>
            )}
          </fieldset>
        </section>

        <section className="lform__card card" aria-labelledby="sec-photos">
          <header className="lform__head">
            <span className="lform__step">2</span>
            <div>
              <h2 id="sec-photos">Photos</h2>
              <p>The first photo is the cover. Daylight photos from several angles sell faster.</p>
            </div>
          </header>
          <ImageUploader
            id="images"
            images={values.images}
            onChange={(images) => {
              set('images', images);
              touch('images');
            }}
            error={visibleError('images')}
          />
          {visibleError('images') && (
            <p className="field__error" role="alert">
              {errors.images}
            </p>
          )}
        </section>

        <section className="lform__card card" aria-labelledby="sec-details">
          <header className="lform__head">
            <span className="lform__step">3</span>
            <div>
              <h2 id="sec-details">Details</h2>
              <p>{category ? `Specifics buyers filter by in ${category.name}.` : 'Choose a category to see relevant fields.'}</p>
            </div>
          </header>

          {category?.hasCondition && (
            <fieldset className={`field ${visibleError('condition') ? 'field--error' : ''}`}>
              <legend className="field__label">
                Condition <span className="field__required">*</span>
              </legend>
              <Segmented
                name="condition"
                value={values.condition}
                onChange={(value) => {
                  set('condition', value);
                  touch('condition');
                }}
                options={CONDITIONS}
              />
              {visibleError('condition') && (
                <p className="field__error" role="alert">
                  {errors.condition}
                </p>
              )}
            </fieldset>
          )}

          {category && (
            <div className="lform__grid">
              {category.attributes.map((attribute) => (
                <Field key={attribute.key} label={attribute.label} optional error={visibleError(`attr_${attribute.key}`)}>
                  {(props) =>
                    attribute.type === 'number' ? (
                      <Input
                        {...props}
                        type="number"
                        inputMode="numeric"
                        min={attribute.min ?? 0}
                        max={attribute.max}
                        suffix={attribute.unit}
                        value={values.attributes[attribute.key] ?? ''}
                        onChange={(e) => setAttribute(attribute.key, e.target.value)}
                        onBlur={() => touch(`attr_${attribute.key}`)}
                      />
                    ) : (
                      <Select
                        {...props}
                        value={values.attributes[attribute.key] ?? ''}
                        onChange={(e) => setAttribute(attribute.key, e.target.value)}
                        placeholder="Select…"
                        options={attribute.options}
                      />
                    )
                  }
                </Field>
              ))}
            </div>
          )}

          <Field
            label="Description"
            required
            error={visibleError('description')}
            hint="Mention condition, what’s included, reason for selling and how to pick it up."
            counter={`${values.description.length}/${LISTING_LIMITS.descriptionMax}`}
          >
            {(props) => (
              <Textarea
                {...props}
                rows={7}
                maxLength={LISTING_LIMITS.descriptionMax}
                value={values.description}
                onChange={(e) => set('description', e.target.value)}
                onBlur={() => touch('description')}
                placeholder="Tell buyers everything they need to know…"
              />
            )}
          </Field>
        </section>

        <section className="lform__card card" aria-labelledby="sec-price">
          <header className="lform__head">
            <span className="lform__step">4</span>
            <div>
              <h2 id="sec-price">{category?.priceLabel ?? 'Price'}</h2>
              <p>Fair prices get more messages. You can always change it later.</p>
            </div>
          </header>
          <Segmented name="priceType" value={values.priceType} onChange={(v) => set('priceType', v)} options={PRICE_TYPES} />
          {values.priceType !== 'free' && (
            <Field
              label={values.priceType === 'exchange' ? 'Estimated value' : category?.priceLabel ?? 'Price'}
              required={!priceless}
              optional={priceless}
              error={visibleError('price')}
            >
              {(props) => (
                <Input
                  {...props}
                  type="number"
                  inputMode="numeric"
                  min="0"
                  step="1"
                  suffix={CURRENCY.symbol}
                  value={values.price}
                  onChange={(e) => set('price', e.target.value)}
                  onBlur={() => touch('price')}
                  placeholder="0"
                  className="lform__price"
                />
              )}
            </Field>
          )}
        </section>

        <section className="lform__card card" aria-labelledby="sec-location">
          <header className="lform__head">
            <span className="lform__step">5</span>
            <div>
              <h2 id="sec-location">Location & contact</h2>
              <p>Buyers see the city; you share the exact address in chat.</p>
            </div>
          </header>
          <div className="lform__grid">
            <Field label="City" required error={visibleError('location')}>
              {(props) => (
                <Select
                  {...props}
                  value={values.location}
                  onChange={(e) => {
                    set('location', e.target.value);
                    touch('location');
                  }}
                  placeholder="Select a city"
                  options={LOCATIONS}
                />
              )}
            </Field>
            <div className="lform__contact">
              <p className="field__label">Contact</p>
              <p>
                <strong>{user?.name}</strong>
                <span className="muted">{user?.phone || 'No phone added — buyers will message you in chat'}</span>
              </p>
              <Link to="/account/settings" className="text-link">
                Edit contact details
              </Link>
            </div>
          </div>
        </section>

        {serverError && (
          <p className="lform__server-error" role="alert">
            {serverError}
          </p>
        )}
      </div>

      <aside className="lform__aside">
        <div className="lform__sticky">
          <div className="card lform__preview">
            <p className="lform__aside-title">Live preview</p>
            <PreviewCard values={values} />
          </div>

          <div className="card lform__quality">
            <div className="lform__quality-head">
              <p className="lform__aside-title">Listing quality</p>
              <span>{Math.round((score / checks.length) * 100)}%</span>
            </div>
            <div className="meter" aria-hidden="true">
              <span style={{ width: `${(score / checks.length) * 100}%` }} />
            </div>
            <ul className="lform__checks">
              {checks.map((check) => (
                <li key={check.label} className={check.done ? 'is-done' : ''}>
                  {check.done ? <Check size={16} aria-hidden="true" /> : <Circle size={16} aria-hidden="true" />}
                  {check.label}
                </li>
              ))}
            </ul>
          </div>

          <div className="lform__buttons">
            {submitted && errorCount > 0 && (
              <p className="field__error" role="alert">
                Please fix {errorCount} {errorCount === 1 ? 'field' : 'fields'} highlighted in red.
              </p>
            )}
            <Button type="submit" size="lg" icon={Send} loading={submitting} block>
              {submitLabel}
            </Button>
            <Button variant="secondary" size="lg" icon={Eye} onClick={() => setPreviewOpen(true)} block>
              Preview
            </Button>
            {cancelTo && (
              <Button variant="ghost" to={cancelTo} block>
                Cancel
              </Button>
            )}
          </div>
        </div>
      </aside>

      <Modal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title="Preview"
        description="This is how buyers will see your listing."
        size="lg"
        variant="sheet"
        footer={
          <>
            <Button variant="secondary" onClick={() => setPreviewOpen(false)}>
              Keep editing
            </Button>
            <Button icon={Send} onClick={submit} loading={submitting}>
              {submitLabel}
            </Button>
          </>
        }
      >
        <ListingPreview values={values} />
      </Modal>
    </form>
  );
}
