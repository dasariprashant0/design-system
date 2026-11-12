import {forwardRef, type HTMLAttributes} from 'react';
import {cx} from '../../utils/cx';

export type BentoGridProps = HTMLAttributes<HTMLDivElement>;

export interface BentoCardProps extends HTMLAttributes<HTMLDivElement> {
  /** Columns to span once the grid has room for them. Default 1. */
  colSpan?: 1 | 2 | 3;
  /** Rows to span. Default 1. */
  rowSpan?: 1 | 2;
}

/** A responsive grid for an asymmetric set of cards: one column on phones, two on tablets, three on desktops. */
export const BentoGrid = forwardRef<HTMLDivElement, BentoGridProps>(function BentoGrid({className, ...rest}, ref) {
  return <div ref={ref} className={cx('bento-grid', className)} {...rest} />;
});

/** One tile in a `BentoGrid`. Spans only apply when there are enough columns, so phones always get a single stack. */
export const BentoCard = forwardRef<HTMLDivElement, BentoCardProps>(function BentoCard({colSpan = 1, rowSpan = 1, className, ...rest}, ref) {
  return <div ref={ref} className={cx('bento-card', colSpan > 1 && `bento-col-${colSpan}`, rowSpan > 1 && `bento-row-${rowSpan}`, className)} {...rest} />;
});
