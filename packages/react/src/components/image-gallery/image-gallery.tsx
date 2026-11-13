'use client';
import {forwardRef, useEffect, useRef, useState, type CSSProperties, type HTMLAttributes} from 'react';
import {Button} from '../button';
import {Dialog, DialogContent, DialogTitle} from '../dialog';
import {cx} from '../../utils/cx';
import {useIsRtl} from '../../utils/direction';

export interface GalleryImage {
  /** Full-size image URL, shown in the lightbox. */
  src: string;
  /** Required: describes the image for people who cannot see it. Used for the thumbnail button's name and the lightbox image. */
  alt: string;
  /** Smaller image URL for the grid. Defaults to `src`. */
  thumbnail?: string;
  /** Optional visible text under the image in the lightbox. */
  caption?: string;
}

export interface ImageGalleryProps extends Omit<HTMLAttributes<HTMLUListElement>, 'children'> {
  /** The images, in order. Each needs `alt` text. */
  images: GalleryImage[];
  /** Number of columns in the thumbnail grid. Default 3. */
  columns?: number;
  /** Called with the index of the image shown whenever the lightbox opens or moves. */
  onIndexChange?: (index: number) => void;
}

/**
 * A grid of thumbnails; choosing one opens a lightbox dialog with Previous and Next buttons.
 * ArrowLeft and ArrowRight move (wrapping), a horizontal swipe does the same, Escape closes and focus returns to the thumbnail of the image last shown.
 * The next and previous images are preloaded. Every image needs `alt`.
 * @example <ImageGallery images={[{src: '/a.jpg', alt: 'A red door'}, {src: '/b.jpg', alt: 'A blue door'}]} />
 */
export const ImageGallery = forwardRef<HTMLUListElement, ImageGalleryProps>(function ImageGallery({images, columns = 3, onIndexChange, className, style, ...rest}, ref) {
  const [index, setIndex] = useState<number | null>(null);
  const start = useRef<{x: number; y: number} | null>(null);
  const thumbs = useRef<Array<HTMLButtonElement | null>>([]);
  const last = useRef(0);
  const isRtl = useIsRtl();
  const n = images.length;
  const open = index !== null && index < n;
  const cur = open ? images[index]! : undefined;

  const go = (i: number) => { const next = (i + n) % n; last.current = next; setIndex(next); onIndexChange?.(next); };

  useEffect(() => {
    if (!open || typeof Image === 'undefined') return;
    for (const j of [index - 1, index + 1]) { const img = images[(j + n) % n]; if (img && n > 1) new Image().src = img.src; }
  }, [index, open, images, n]);

  const keydown = (e: React.KeyboardEvent) => {
    if (n < 2 || (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight')) return;
    e.preventDefault();
    const forward = (e.key === 'ArrowRight') !== isRtl(e.currentTarget as Element);
    go(index! + (forward ? 1 : -1));
  };

  return (
    <>
      <ul ref={ref} className={cx('image-gallery', className)} style={{'--gallery-columns': columns, ...style} as CSSProperties} {...rest}>
        {images.map((img, i) => (
          <li key={img.src}>
            <button type="button" ref={(el) => { thumbs.current[i] = el; }} className="image-gallery-thumb" aria-haspopup="dialog" onClick={() => go(i)}>
              <img src={img.thumbnail ?? img.src} alt={img.alt} loading="lazy" />
            </button>
          </li>
        ))}
      </ul>
      <Dialog open={open} onOpenChange={(o) => { if (!o) setIndex(null); }}>
        <DialogContent className="image-gallery-lightbox" aria-describedby={undefined} onKeyDown={keydown} onCloseAutoFocus={(e) => { e.preventDefault(); thumbs.current[last.current]?.focus(); }}>
          <DialogTitle className="image-gallery-title">Image {(index ?? 0) + 1} of {n}</DialogTitle>
          {cur && (
            <figure
              className="image-gallery-figure"
              onPointerDown={(e) => { start.current = {x: e.clientX, y: e.clientY}; }}
              onPointerUp={(e) => {
                const s = start.current; start.current = null;
                if (!s || n < 2) return;
                const dx = e.clientX - s.x;
                if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(e.clientY - s.y) * 2) go(index! + (dx < 0 !== isRtl(e.currentTarget) ? 1 : -1));
              }}
            >
              <img key={cur.src} src={cur.src} alt={cur.alt} draggable={false} />
              {cur.caption && <figcaption>{cur.caption}</figcaption>}
            </figure>
          )}
          {n > 1 && (
            <div className="image-gallery-nav">
              <Button size="sm" onClick={() => go(index! - 1)}>Previous</Button>
              <Button size="sm" onClick={() => go(index! + 1)}>Next</Button>
            </div>
          )}
          <span role="status" className="sr-only">{cur ? `${cur.alt}, ${index! + 1} of ${n}` : ''}</span>
        </DialogContent>
      </Dialog>
    </>
  );
});
