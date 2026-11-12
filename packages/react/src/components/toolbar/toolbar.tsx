import {forwardRef, type ComponentPropsWithoutRef, type ElementRef} from 'react';
import {Toolbar as Radix} from 'radix-ui';
import {cx} from '../../utils/cx';

type RootProps = Omit<ComponentPropsWithoutRef<typeof Radix.Root>, 'aria-label'> & {
  /** Names the toolbar, for example "Text formatting". */
  'aria-label': string;
};

export const Toolbar = forwardRef<ElementRef<typeof Radix.Root>, RootProps>(function Toolbar({className, ...rest}, ref) {
  return <Radix.Root ref={ref} className={cx('toolbar', className)} {...rest} />;
});
export const ToolbarButton = forwardRef<ElementRef<typeof Radix.Button>, ComponentPropsWithoutRef<typeof Radix.Button>>(function ToolbarButton({className, ...rest}, ref) {
  return <Radix.Button ref={ref} className={cx('toolbar-item', className)} {...rest} />;
});
export const ToolbarLink = forwardRef<ElementRef<typeof Radix.Link>, ComponentPropsWithoutRef<typeof Radix.Link>>(function ToolbarLink({className, ...rest}, ref) {
  return <Radix.Link ref={ref} className={cx('toolbar-item', className)} {...rest} />;
});
export const ToolbarSeparator = forwardRef<ElementRef<typeof Radix.Separator>, ComponentPropsWithoutRef<typeof Radix.Separator>>(function ToolbarSeparator({className, ...rest}, ref) {
  return <Radix.Separator ref={ref} className={cx('toolbar-sep', className)} {...rest} />;
});
