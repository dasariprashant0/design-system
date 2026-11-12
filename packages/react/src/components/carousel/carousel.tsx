'use client';
import {Children, forwardRef, useRef, type HTMLAttributes} from 'react';
import {cx} from '../../utils/cx';

export interface CarouselProps extends HTMLAttributes<HTMLDivElement> {
  /** Names the carousel, for example "Featured projects". */
  'aria-label': string;
}

/** Wrap each slide in a CarouselItem. Native scroll-snap does the movement. */
export const Carousel = forwardRef<HTMLDivElement, CarouselProps>(function Carousel({className, children, ...rest}, ref) {
  const track = useRef<HTMLDivElement>(null);
  const items = Children.toArray(children);
  const step = (dir: 1 | -1) => { const el = track.current; if (el) el.scrollBy?.({left: dir * el.clientWidth * 0.9, behavior: 'smooth'}); };
  return (
    <div ref={ref} role="region" aria-roledescription="carousel" className={cx('carousel', className)} {...rest}>
      <div ref={track} className="carousel-track" tabIndex={0} aria-label={`${rest['aria-label']} slides`}>
        {items.map((c, i) => <div key={i} role="group" aria-roledescription="slide" aria-label={`${i + 1} of ${items.length}`} className="carousel-slide">{c}</div>)}
      </div>
      <div className="carousel-controls">
        <button type="button" className="btn btn-line btn-sm" onClick={() => step(-1)}>Previous<span className="sr-only"> slide</span></button>
        <button type="button" className="btn btn-line btn-sm" onClick={() => step(1)}>Next<span className="sr-only"> slide</span></button>
      </div>
    </div>
  );
});

export const CarouselItem = ({children}: {children: React.ReactNode}) => <>{children}</>;
