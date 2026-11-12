'use client';
import {forwardRef, useState, type ImgHTMLAttributes} from 'react';
import {cx} from '../../utils/cx';

export interface ImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  /** Required. Describe the image, or pass "" if it is decorative. */
  alt: string;
  /** Width / height, for example `16 / 9`. Reserves space so the page does not jump. */
  ratio?: number;
  /** How the image fills its box when `ratio` crops it: `cover` (default) or `contain`. */
  fit?: 'cover' | 'contain';
}

/** Lazy-loaded by default. If the source fails, the alt text is shown in its place. */
export const Image = forwardRef<HTMLImageElement, ImageProps>(function Image({ratio, fit = 'cover', className, style, alt, onError, ...rest}, ref) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return <div role="img" aria-label={alt} className={cx('image image-fallback', className)} style={{aspectRatio: ratio, ...style}}>{alt}</div>;
  }
  return (
    <img
      ref={ref}
      loading="lazy"
      decoding="async"
      alt={alt}
      className={cx('image', `image-${fit}`, className)}
      style={{aspectRatio: ratio, ...style}}
      onError={(e) => { setFailed(true); onError?.(e); }}
      {...rest}
    />
  );
});
