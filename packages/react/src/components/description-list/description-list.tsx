import {forwardRef, type HTMLAttributes, type ReactNode} from 'react';
import {cx} from '../../utils/cx';

export interface DescriptionItem {
  term: ReactNode;
  details: ReactNode;
}

export interface DescriptionListProps extends Omit<HTMLAttributes<HTMLDListElement>, 'children'> {
  /** The term and details pairs to show, in order. */
  items: DescriptionItem[];
  /** `stacked` puts each term above its value; `inline` puts them side by side. */
  layout?: 'inline' | 'stacked';
}

/** A `dl` of term and details pairs, for facts such as an order summary or a profile. `layout` switches between side by side and stacked. */
export const DescriptionList = forwardRef<HTMLDListElement, DescriptionListProps>(function DescriptionList({items, layout = 'inline', className, ...rest}, ref) {
  return (
    <dl ref={ref} className={cx('dlist', layout === 'stacked' && 'dlist-stacked', className)} {...rest}>
      {items.map((it, i) => (
        <div key={i} className="dlist-row"><dt>{it.term}</dt><dd>{it.details}</dd></div>
      ))}
    </dl>
  );
});
