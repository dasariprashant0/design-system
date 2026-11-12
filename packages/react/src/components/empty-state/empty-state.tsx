import {forwardRef, type HTMLAttributes, type ReactNode} from 'react';
import {cx} from '../../utils/cx';

export interface EmptyStateProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Short headline saying what is missing, for example "No projects yet". */
  title: ReactNode;
  /** Optional sentence explaining why it is empty or what to do next. */
  description?: ReactNode;
  /** Optional inline SVG, `aria-hidden`. */
  icon?: ReactNode;
  /** The next step: a Button or link. */
  children?: ReactNode;
}

/** Shown when a list, search or table has nothing to display. */
export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(function EmptyState({title, description, icon, children, className, ...rest}, ref) {
  return (
    <div ref={ref} className={cx('empty', className)} {...rest}>
      {icon && <div className="empty-icon" aria-hidden="true">{icon}</div>}
      <h3 className="empty-title">{title}</h3>
      {description && <p className="empty-description">{description}</p>}
      {children && <div className="empty-actions">{children}</div>}
    </div>
  );
});
