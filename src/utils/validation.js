import { LISTING_LIMITS, LOCATIONS } from '../config/site';
import { getCategoryById } from '../data/categories';

export const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(value).trim());

const hasErrors = (errors) => Object.keys(errors).length > 0;

export function validateListing(values) {
  const errors = {};
  const title = values.title.trim();
  const description = values.description.trim();
  const category = getCategoryById(values.category);

  if (!title) errors.title = 'Give your listing a title.';
  else if (title.length < LISTING_LIMITS.titleMin)
    errors.title = `The title should be at least ${LISTING_LIMITS.titleMin} characters — be specific.`;
  else if (title.length > LISTING_LIMITS.titleMax)
    errors.title = `Keep the title under ${LISTING_LIMITS.titleMax} characters.`;

  if (!category) errors.category = 'Choose a category.';

  const priceless = values.priceType === 'free' || values.priceType === 'exchange';
  if (!priceless) {
    const price = Number(values.price);
    if (values.price === '' || values.price === null) errors.price = 'Enter a price.';
    else if (!Number.isFinite(price) || price <= 0) errors.price = 'Price must be a positive number.';
    else if (price > LISTING_LIMITS.maxPrice) errors.price = 'That price looks too high.';
  }

  if (category?.hasCondition && !values.condition) errors.condition = 'Select the condition.';

  if (!description) errors.description = 'Describe what you are offering.';
  else if (description.length < LISTING_LIMITS.descriptionMin)
    errors.description = `Add a bit more detail — at least ${LISTING_LIMITS.descriptionMin} characters.`;
  else if (description.length > LISTING_LIMITS.descriptionMax)
    errors.description = `Description is limited to ${LISTING_LIMITS.descriptionMax} characters.`;

  if (!values.location || !LOCATIONS.includes(values.location)) errors.location = 'Select a city.';

  if (!values.images.length) errors.images = 'Add at least one photo — listings with photos sell 3× faster.';
  else if (values.images.length > LISTING_LIMITS.maxImages)
    errors.images = `You can add up to ${LISTING_LIMITS.maxImages} photos.`;

  category?.attributes.forEach((attribute) => {
    const value = values.attributes?.[attribute.key];
    if (attribute.type === 'number' && value !== '' && value !== undefined && value !== null) {
      const number = Number(value);
      if (!Number.isFinite(number) || number < (attribute.min ?? 0)) {
        errors[`attr_${attribute.key}`] = `Enter a valid ${attribute.label.toLowerCase()}.`;
      } else if (attribute.max !== undefined && number > attribute.max) {
        errors[`attr_${attribute.key}`] = `${attribute.label} cannot be more than ${attribute.max}.`;
      }
    }
  });

  return { errors, valid: !hasErrors(errors) };
}

export function validatePassword(password) {
  if (!password) return 'Enter a password.';
  if (password.length < 8) return 'Use at least 8 characters.';
  if (!/[a-zA-Z]/.test(password) || !/\d/.test(password)) return 'Use both letters and numbers.';
  return null;
}

export function validateRegister(values) {
  const errors = {};
  if (values.name.trim().length < 2) errors.name = 'Enter your name.';
  if (!isEmail(values.email)) errors.email = 'Enter a valid email address.';
  const passwordError = validatePassword(values.password);
  if (passwordError) errors.password = passwordError;
  if (values.confirm !== values.password) errors.confirm = 'Passwords do not match.';
  if (!values.city) errors.city = 'Select your city.';
  if (!values.terms) errors.terms = 'Please accept the terms to continue.';
  return { errors, valid: !hasErrors(errors) };
}

export function validateLogin(values) {
  const errors = {};
  if (!isEmail(values.email)) errors.email = 'Enter a valid email address.';
  if (!values.password) errors.password = 'Enter your password.';
  return { errors, valid: !hasErrors(errors) };
}

export function validateProfile(values) {
  const errors = {};
  if (values.name.trim().length < 2) errors.name = 'Enter your name.';
  if (!isEmail(values.email)) errors.email = 'Enter a valid email address.';
  if (values.phone && !/^\+?[\d\s()-]{9,18}$/.test(values.phone.trim()))
    errors.phone = 'Enter a phone number like +380 67 123 45 67.';
  if (!values.city) errors.city = 'Select your city.';
  if (values.bio.length > 400) errors.bio = 'Keep your bio under 400 characters.';
  return { errors, valid: !hasErrors(errors) };
}
