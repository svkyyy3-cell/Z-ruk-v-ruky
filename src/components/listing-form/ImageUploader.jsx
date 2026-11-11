import { useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ImagePlus, Star, Trash2, UploadCloud } from 'lucide-react';
import { LISTING_LIMITS } from '../../config/site';
import { compressImage, resolveImage } from '../../utils/images';
import { Spinner } from '../ui/Spinner';

/**
 * Multi-image uploader with drag & drop, client-side compression, reordering
 * and cover selection. Value is an array of image references.
 */
export function ImageUploader({ images, onChange, error, id }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [processing, setProcessing] = useState(0);
  const [uploadErrors, setUploadErrors] = useState([]);
  const remaining = LISTING_LIMITS.maxImages - images.length;

  const addFiles = async (fileList) => {
    const files = Array.from(fileList);
    if (!files.length) return;
    const accepted = files.slice(0, Math.max(0, remaining));
    const problems = [];
    if (files.length > accepted.length) {
      problems.push(`Only ${LISTING_LIMITS.maxImages} photos are allowed — ${files.length - accepted.length} skipped.`);
    }
    setProcessing(accepted.length);
    const results = [];
    for (const file of accepted) {
      try {
        results.push(await compressImage(file));
      } catch (err) {
        problems.push(err.message);
      } finally {
        setProcessing((n) => n - 1);
      }
    }
    setUploadErrors(problems);
    if (results.length) onChange([...images, ...results]);
  };

  const move = (from, to) => {
    if (to < 0 || to >= images.length) return;
    const next = [...images];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  const remove = (index) => onChange(images.filter((_, i) => i !== index));

  return (
    <div className="uploader">
      {remaining > 0 && (
        <div
          className={`uploader__drop ${dragging ? 'is-dragging' : ''} ${error ? 'has-error' : ''}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            addFiles(e.dataTransfer.files);
          }}
        >
          <span className="uploader__icon" aria-hidden="true">
            <UploadCloud size={26} />
          </span>
          <p className="uploader__title">Drag photos here or</p>
          <button type="button" className="btn btn--dark btn--sm" onClick={() => inputRef.current?.click()} id={id}>
            <ImagePlus size={16} aria-hidden="true" />
            <span>Choose photos</span>
          </button>
          <p className="uploader__hint">
            JPG, PNG or WebP · up to {LISTING_LIMITS.maxImages} photos · {remaining} left
          </p>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => {
              addFiles(e.target.files);
              e.target.value = '';
            }}
          />
        </div>
      )}

      {uploadErrors.length > 0 && (
        <ul className="uploader__errors" role="alert">
          {uploadErrors.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      )}

      {(images.length > 0 || processing > 0) && (
        <ul className="uploader__grid">
          {images.map((src, index) => (
            <li key={`${index}-${src.slice(-24)}`} className="uploader__item">
              <img src={resolveImage(src, { w: 320, h: 240 })} alt={`Photo ${index + 1}`} />
              {index === 0 && (
                <span className="uploader__cover">
                  <Star size={12} fill="currentColor" aria-hidden="true" /> Cover
                </span>
              )}
              <div className="uploader__tools">
                <button type="button" onClick={() => move(index, index - 1)} disabled={index === 0} aria-label={`Move photo ${index + 1} left`}>
                  <ArrowLeft size={15} />
                </button>
                {index !== 0 && (
                  <button type="button" onClick={() => move(index, 0)} aria-label={`Make photo ${index + 1} the cover`} title="Make cover">
                    <Star size={15} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => move(index, index + 1)}
                  disabled={index === images.length - 1}
                  aria-label={`Move photo ${index + 1} right`}
                >
                  <ArrowRight size={15} />
                </button>
                <button type="button" onClick={() => remove(index)} aria-label={`Remove photo ${index + 1}`} className="is-danger">
                  <Trash2 size={15} />
                </button>
              </div>
            </li>
          ))}
          {Array.from({ length: processing }, (_, i) => (
            <li key={`p-${i}`} className="uploader__item uploader__item--processing">
              <Spinner size={22} label="Processing photo" />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
