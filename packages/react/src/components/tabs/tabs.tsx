import {forwardRef, type ComponentPropsWithoutRef, type ElementRef} from 'react';
import {Tabs as RadixTabs} from 'radix-ui';
import {cx} from '../../utils/cx';

/** The root of a tabbed interface. Use `value` and `onValueChange` (or `defaultValue`); put a `TabsList` and one `TabsContent` per tab inside. */
export const Tabs = forwardRef<ElementRef<typeof RadixTabs.Root>, ComponentPropsWithoutRef<typeof RadixTabs.Root>>(function Tabs({className, ...rest}, ref) {
  return <RadixTabs.Root ref={ref} className={cx('tabs-root', className)} {...rest} />;
});
/** The row of tab buttons. Arrow keys move between them. */
export const TabsList = forwardRef<ElementRef<typeof RadixTabs.List>, ComponentPropsWithoutRef<typeof RadixTabs.List>>(function TabsList({className, ...rest}, ref) {
  return <RadixTabs.List ref={ref} className={cx('tabs-list', className)} {...rest} />;
});
/** One tab button; its `value` must match a `TabsContent`. */
export const TabsTrigger = forwardRef<ElementRef<typeof RadixTabs.Trigger>, ComponentPropsWithoutRef<typeof RadixTabs.Trigger>>(function TabsTrigger({className, ...rest}, ref) {
  return <RadixTabs.Trigger ref={ref} className={cx('tabs-trigger', className)} {...rest} />;
});
/** The panel shown when the tab with the same `value` is selected. */
export const TabsContent = forwardRef<ElementRef<typeof RadixTabs.Content>, ComponentPropsWithoutRef<typeof RadixTabs.Content>>(function TabsContent({className, ...rest}, ref) {
  return <RadixTabs.Content ref={ref} className={cx('tabs-content', className)} {...rest} />;
});
