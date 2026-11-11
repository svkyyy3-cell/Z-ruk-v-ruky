import { LISTING_LIMITS } from '../config/site';

const UNSPLASH = 'https://images.unsplash.com/photo-';

/**
 * Turns a stored image reference into a URL.
 *  - "u:<id>"            → Unsplash photo, cropped to the requested size
 *  - "u:<id>@x,y,zoom"   → focal-point detail crop of the same photo
 *  - data:/http(s) URLs  → returned unchanged (user uploads)
 */
export function resolveImage(src, { w = 800, h } = {}) {
  if (!src) return '';
  if (!src.startsWith('u:')) return src;
  const [id, focus] = src.slice(2).split('@');
  const params = new URLSearchParams({ auto: 'format', fit: 'crop', w: String(w), q: '75' });
  if (h) params.set('h', String(h));
  if (focus) {
    const [x, y, z] = focus.split(',');
    params.set('crop', 'focalpoint');
    params.set('fp-x', x);
    params.set('fp-y', y);
    params.set('fp-z', z);
  }
  return `${UNSPLASH}${id}?${params}`;
}

/** 2x srcset for remote images; uploads are already sized. */
export function imageSrcSet(src, w, h) {
  if (!src?.startsWith('u:')) return undefined;
  return `${resolveImage(src, { w, h })} 1x, ${resolveImage(src, { w: w * 2, h: h ? h * 2 : undefined })} 2x`;
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('This image could not be read. Try a JPG, PNG or WebP file.'));
    img.src = url;
  });
}

/**
 * Validates and downsizes an uploaded photo so it fits comfortably in
 * localStorage. Returns a JPEG data URL.
 */
export async function compressImage(file, { maxSize = 1280, quality = 0.78 } = {}) {
  if (!file.type.startsWith('image/')) {
    throw new Error(`"${file.name}" is not an image.`);
  }
  if (file.size > LISTING_LIMITS.maxImageMb * 1024 * 1024) {
    throw new Error(`"${file.name}" is larger than ${LISTING_LIMITS.maxImageMb} MB.`);
  }
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    const scale = Math.min(1, maxSize / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', quality);
  } finally {
    URL.revokeObjectURL(url);
  }
}
