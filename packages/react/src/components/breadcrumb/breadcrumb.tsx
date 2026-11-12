import {forwardRef, type HTMLAttributes, type ReactNode} from 'react';
import {cx} from '../../utils/cx';

export interface BreadcrumbItem {
  label: ReactNode;
  /** Omit on the current page. */
  href?: string;
}
export interface BreadcrumbProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  /** The trail from the root to the current page; the last item is treated as the current page and is not a link. */
  items: BreadcrumbItem[];
  /** Name of the landmark. */
  'aria-label'?: string;
}

/** Where you are in the site. The last item is the current page. */
export const Breadcrumb = forwardRef<HTMLElement, BreadcrumbProps>(function Breadcrumb({items, className, 'aria-label': label = 'Breadcrumb', ...rest}, ref) {
  return (
    <nav ref={ref} aria-label={label} className={className} {...rest}>
      <ol className={cx('crumbs')}>
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={i} aria-current={last ? 'page' : undefined}>
              {item.href && !last ? <a className="link" href={item.href}>{item.label}</a> : item.label}
            </li>
          );
        })}
      </ol>
    </nav>
  );
});
