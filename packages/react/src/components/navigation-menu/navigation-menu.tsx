import {forwardRef, type ComponentPropsWithoutRef, type ElementRef} from 'react';
import {NavigationMenu as Radix} from 'radix-ui';
import {cx} from '../../utils/cx';

/** A site navigation bar whose items can open rich panels of links. Put a `NavigationMenuList` inside; the panels share one viewport. */
export const NavigationMenu = forwardRef<ElementRef<typeof Radix.Root>, ComponentPropsWithoutRef<typeof Radix.Root>>(function NavigationMenu({className, children, ...rest}, ref) {
  return (
    <Radix.Root ref={ref} className={cx('navmenu', className)} {...rest}>
      {children}
      <div className="navmenu-viewport-wrap"><Radix.Viewport className="navmenu-viewport" /></div>
    </Radix.Root>
  );
});
/** The row that holds the `NavigationMenuItem`s. */
export const NavigationMenuList = forwardRef<ElementRef<typeof Radix.List>, ComponentPropsWithoutRef<typeof Radix.List>>(function NavigationMenuList({className, ...rest}, ref) {
  return <Radix.List ref={ref} className={cx('navmenu-list', className)} {...rest} />;
});
/** One entry in the list: either a `NavigationMenuLink`, or a `NavigationMenuTrigger` with its `NavigationMenuContent`. */
export const NavigationMenuItem = Radix.Item;
/** The button that opens its item's panel; shows a small arrow. */
export const NavigationMenuTrigger = forwardRef<ElementRef<typeof Radix.Trigger>, ComponentPropsWithoutRef<typeof Radix.Trigger>>(function NavigationMenuTrigger({className, children, ...rest}, ref) {
  return <Radix.Trigger ref={ref} className={cx('navmenu-link navmenu-trigger', className)} {...rest}>{children}<span aria-hidden="true"> ▾</span></Radix.Trigger>;
});
/** The panel of links shown under the trigger when it is open. */
export const NavigationMenuContent = forwardRef<ElementRef<typeof Radix.Content>, ComponentPropsWithoutRef<typeof Radix.Content>>(function NavigationMenuContent({className, ...rest}, ref) {
  return <Radix.Content ref={ref} className={cx('navmenu-content', className)} {...rest} />;
});
/** A link in the bar or inside a panel; use `asChild` for a router link and `active` to mark the current page. */
export const NavigationMenuLink = forwardRef<ElementRef<typeof Radix.Link>, ComponentPropsWithoutRef<typeof Radix.Link>>(function NavigationMenuLink({className, ...rest}, ref) {
  return <Radix.Link ref={ref} className={cx('navmenu-link', className)} {...rest} />;
});
