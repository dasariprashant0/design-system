import {forwardRef, type ButtonHTMLAttributes} from 'react';
import {Slot} from 'radix-ui';
import {cx} from '../../utils/cx';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** `solid` is the one main action per view. `line` for the rest, `ghost` for inline links, `danger` for destructive. */
  variant?: 'solid' | 'line' | 'ghost' | 'danger';
  /** `md` (default), `sm` for dense toolbars and table rows, or `lg` for prominent calls to action. Same heights as Input and Select. */
  size?: 'sm' | 'md' | 'lg';
  /** Shows a spinner, sets `aria-busy` and ignores clicks. The label stays so the width does not jump. */
  loading?: boolean;
  /** Render the child element (a link, a router link) with the button styles instead of a `<button>`. */
  asChild?: boolean;
}

/**
 * A native `<button>` with Monoline styles. One `solid` button per view.
 * @example <Button variant="line" onClick={save}>Save</Button>
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {variant = 'line', size = 'md', loading = false, asChild = false, className, children, disabled, type, onClick, ...rest},
  ref,
) {
  const Comp = asChild ? Slot.Root : 'button';
  return (
    <Comp
      ref={ref}
      type={asChild ? undefined : (type ?? 'button')}
      className={cx('btn', `btn-${variant}`, size !== 'md' && `btn-${size}`, className)}
      disabled={disabled}
      aria-busy={loading || undefined}
      aria-disabled={loading || undefined}
      data-loading={loading || undefined}
      data-disabled={disabled ? '' : undefined}
      onClick={loading ? (e: React.MouseEvent) => e.preventDefault() : onClick}
      {...rest}
    >
      {asChild ? children : (
        <>
          {loading && <span className="spinner" aria-hidden="true" />}
          {children}
        </>
      )}
    </Comp>
  );
});
