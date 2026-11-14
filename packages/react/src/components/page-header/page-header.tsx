import {createElement, forwardRef, type HTMLAttributes, type ReactNode} from 'react';
import {cx} from '../../utils/cx';

export interface PageHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** The page title, rendered as a heading. */
  title: ReactNode;
  /** One sentence under the title saying what the page is for. */
  description?: ReactNode;
  /** Shown above the title: a `Breadcrumb` or `BreadcrumbsAuto`. */
  breadcrumbs?: ReactNode;
  /** Buttons at the end of the title row. They wrap under the title on small screens. */
  actions?: ReactNode;
  /** The heading level, 1 to 4. Default 1: one per page. */
  level?: 1 | 2 | 3 | 4;
}

/**
 * The top of a page: breadcrumbs, a title, a description and actions.
 * @example <PageHeader title="Customers" description="Everyone who has signed up." actions={<Button variant="solid">Add customer</Button>} />
 */
export const PageHeader = forwardRef<HTMLDivElement, PageHeaderProps>(function PageHeader({title, description, breadcrumbs, actions, level = 1, className, ...rest}, ref) {
  return (
    <div ref={ref} className={cx('page-header', className)} {...rest}>
      {breadcrumbs}
      <div className="page-header-row">
        <div className="page-header-text">
          {createElement(`h${level}`, {className: 'page-header-title'}, title)}
          {description && <p className="page-header-description">{description}</p>}
        </div>
        {actions && <div className="page-header-actions">{actions}</div>}
      </div>
    </div>
  );
});
