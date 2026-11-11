import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react';
import { resolveImage } from '../../utils/images';

/**
 * Product gallery: swipeable main image (scroll-snap), thumbnails, keyboard
 * navigation and a fullscreen lightbox.
 */
export function Gallery({ images, title }) {
  const [index, setIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const trackRef = useRef(null);
  const count = images.length;
  const current = Math.min(index, count - 1);

  const goTo = (next) => {
    const target = (next + count) % count;
    setIndex(target);
    const track = trackRef.current;
    if (track) track.scrollTo({ left: track.clientWidth * target, behavior: 'smooth' });
  };

  // Keep the index in sync when the user swipes the track.
  const onScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    const next = Math.round(track.scrollLeft / track.clientWidth);
    if (next !== index) setIndex(next);
  };

  const onKeyDown = (event) => {
    if (event.key === 'ArrowRight') goTo(current + 1);
    if (event.key === 'ArrowLeft') goTo(current - 1);
  };

  return (
    <div className="gallery">
      <div className="gallery__stage" tabIndex={0} onKeyDown={onKeyDown} aria-roledescription="carousel" aria-label={`${title} photos`}>
        <div className="gallery__track" ref={trackRef} onScroll={onScroll}>
          {images.map((src, i) => (
            <button
              type="button"
              className="gallery__slide"
              key={src + i}
              onClick={() => setLightbox(true)}
              aria-label={`Open photo ${i + 1} of ${count} fullscreen`}
            >
              <img
                src={resolveImage(src, { w: 1200, h: 900 })}
                alt={i === 0 ? title : ''}
                loading={i === 0 ? 'eager' : 'lazy'}
                decoding="async"
              />
            </button>
          ))}
        </div>
        {count > 1 && (
          <>
            <button type="button" className="gallery__nav gallery__nav--prev" onClick={() => goTo(current - 1)} aria-label="Previous photo">
              <ChevronLeft size={22} />
            </button>
            <button type="button" className="gallery__nav gallery__nav--next" onClick={() => goTo(current + 1)} aria-label="Next photo">
              <ChevronRight size={22} />
            </button>
          </>
        )}
        <span className="gallery__counter" aria-live="polite">
          {current + 1} / {count}
        </span>
        <button type="button" className="gallery__expand" onClick={() => setLightbox(true)} aria-label="View fullscreen">
          <Expand size={18} />
        </button>
      </div>

      {count > 1 && (
        <div className="gallery__thumbs" role="tablist" aria-label="Choose photo">
          {images.map((src, i) => (
            <button
              type="button"
              role="tab"
              aria-selected={i === current}
              aria-label={`Photo ${i + 1}`}
              key={src + i}
              className={`gallery__thumb ${i === current ? 'is-active' : ''}`}
              onClick={() => goTo(i)}
            >
              <img src={resolveImage(src, { w: 160, h: 120 })} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      )}

      {lightbox && (
        <Lightbox images={images} start={current} title={title} onClose={() => setLightbox(false)} onChange={goTo} />
      )}
    </div>
  );
}

function Lightbox({ images, start, title, onClose, onChange }) {
  const [index, setIndex] = useState(start);
  const count = images.length;
  const closeRef = useRef(null);

  const move = (delta) => {
    const next = (index + delta + count) % count;
    setIndex(next);
    onChange(next);
  };
  const moveRef = useRef(move);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    moveRef.current = move;
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    closeRef.current?.focus();
    document.body.style.overflow = 'hidden';
    const onKey = (event) => {
      if (event.key === 'Escape') onCloseRef.current();
      if (event.key === 'ArrowRight') moveRef.current(1);
      if (event.key === 'ArrowLeft') moveRef.current(-1);
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, []);

  return createPortal(
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={`${title} — photo ${index + 1} of ${count}`}>
      <button ref={closeRef} type="button" className="lightbox__close" onClick={onClose} aria-label="Close">
        <X size={22} />
      </button>
      <img className="lightbox__img" src={resolveImage(images[index], { w: 1800 })} alt="" />
      {count > 1 && (
        <>
          <button type="button" className="lightbox__nav lightbox__nav--prev" onClick={() => move(-1)} aria-label="Previous photo">
            <ChevronLeft size={26} />
          </button>
          <button type="button" className="lightbox__nav lightbox__nav--next" onClick={() => move(1)} aria-label="Next photo">
            <ChevronRight size={26} />
          </button>
        </>
      )}
      <p className="lightbox__counter">
        {index + 1} / {count}
      </p>
    </div>,
    document.body,
  );
}
