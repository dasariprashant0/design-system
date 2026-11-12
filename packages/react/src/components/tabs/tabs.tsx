import {forwardRef, type ComponentPropsWithoutRef, type ElementRef} from 'react';
import {Tabs as RadixTabs} from 'radix-ui';
import {cx} from '../../utils/cx';

export const Tabs = forwardRef<ElementRef<typeof RadixTabs.Root>, ComponentPropsWithoutRef<typeof RadixTabs.Root>>(function Tabs({className, ...rest}, ref) {
  return <RadixTabs.Root ref={ref} className={cx('tabs-root', className)} {...rest} />;
});
export const TabsList = forwardRef<ElementRef<typeof RadixTabs.List>, ComponentPropsWithoutRef<typeof RadixTabs.List>>(function TabsList({className, ...rest}, ref) {
  return <RadixTabs.List ref={ref} className={cx('tabs-list', className)} {...rest} />;
});
export const TabsTrigger = forwardRef<ElementRef<typeof RadixTabs.Trigger>, ComponentPropsWithoutRef<typeof RadixTabs.Trigger>>(function TabsTrigger({className, ...rest}, ref) {
  return <RadixTabs.Trigger ref={ref} className={cx('tabs-trigger', className)} {...rest} />;
});
export const TabsContent = forwardRef<ElementRef<typeof RadixTabs.Content>, ComponentPropsWithoutRef<typeof RadixTabs.Content>>(function TabsContent({className, ...rest}, ref) {
  return <RadixTabs.Content ref={ref} className={cx('tabs-content', className)} {...rest} />;
});
