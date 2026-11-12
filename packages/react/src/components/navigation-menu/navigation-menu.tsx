import {forwardRef, type ComponentPropsWithoutRef, type ElementRef} from 'react';
import {NavigationMenu as Radix} from 'radix-ui';
import {cx} from '../../utils/cx';

export const NavigationMenu = forwardRef<ElementRef<typeof Radix.Root>, ComponentPropsWithoutRef<typeof Radix.Root>>(function NavigationMenu({className, children, ...rest}, ref) {
  return (
    <Radix.Root ref={ref} className={cx('navmenu', className)} {...rest}>
      {children}
      <div className="navmenu-viewport-wrap"><Radix.Viewport className="navmenu-viewport" /></div>
    </Radix.Root>
  );
});
export const NavigationMenuList = forwardRef<ElementRef<typeof Radix.List>, ComponentPropsWithoutRef<typeof Radix.List>>(function NavigationMenuList({className, ...rest}, ref) {
  return <Radix.List ref={ref} className={cx('navmenu-list', className)} {...rest} />;
});
export const NavigationMenuItem = Radix.Item;
export const NavigationMenuTrigger = forwardRef<ElementRef<typeof Radix.Trigger>, ComponentPropsWithoutRef<typeof Radix.Trigger>>(function NavigationMenuTrigger({className, children, ...rest}, ref) {
  return <Radix.Trigger ref={ref} className={cx('navmenu-link navmenu-trigger', className)} {...rest}>{children}<span aria-hidden="true"> ▾</span></Radix.Trigger>;
});
export const NavigationMenuContent = forwardRef<ElementRef<typeof Radix.Content>, ComponentPropsWithoutRef<typeof Radix.Content>>(function NavigationMenuContent({className, ...rest}, ref) {
  return <Radix.Content ref={ref} className={cx('navmenu-content', className)} {...rest} />;
});
export const NavigationMenuLink = forwardRef<ElementRef<typeof Radix.Link>, ComponentPropsWithoutRef<typeof Radix.Link>>(function NavigationMenuLink({className, ...rest}, ref) {
  return <Radix.Link ref={ref} className={cx('navmenu-link', className)} {...rest} />;
});
