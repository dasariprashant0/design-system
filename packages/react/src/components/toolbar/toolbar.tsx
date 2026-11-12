import {forwardRef, type ComponentPropsWithoutRef, type ElementRef} from 'react';
import {Toolbar as Radix} from 'radix-ui';
import {cx} from '../../utils/cx';

type RootProps = Omit<ComponentPropsWithoutRef<typeof Radix.Root>, 'aria-label'> & {
  /** Names the toolbar, for example "Text formatting". */
  'aria-label': string;
};

/** A single tab stop that groups related controls; arrow keys move between them. Requires an `aria-label`. */
export const Toolbar = forwardRef<ElementRef<typeof Radix.Root>, RootProps>(function Toolbar({className, ...rest}, ref) {
  return <Radix.Root ref={ref} className={cx('toolbar', className)} {...rest} />;
});
/** A button inside the toolbar. */
export const ToolbarButton = forwardRef<ElementRef<typeof Radix.Button>, ComponentPropsWithoutRef<typeof Radix.Button>>(function ToolbarButton({className, ...rest}, ref) {
  return <Radix.Button ref={ref} className={cx('toolbar-item', className)} {...rest} />;
});
/** A link inside the toolbar. */
export const ToolbarLink = forwardRef<ElementRef<typeof Radix.Link>, ComponentPropsWithoutRef<typeof Radix.Link>>(function ToolbarLink({className, ...rest}, ref) {
  return <Radix.Link ref={ref} className={cx('toolbar-item', className)} {...rest} />;
});
/** A thin divider between groups of controls. */
export const ToolbarSeparator = forwardRef<ElementRef<typeof Radix.Separator>, ComponentPropsWithoutRef<typeof Radix.Separator>>(function ToolbarSeparator({className, ...rest}, ref) {
  return <Radix.Separator ref={ref} className={cx('toolbar-sep', className)} {...rest} />;
});
