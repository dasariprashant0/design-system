import {forwardRef, type ComponentPropsWithoutRef, type ElementRef} from 'react';
import {ToggleGroup as RadixToggleGroup} from 'radix-ui';
import {cx} from '../../utils/cx';

/** `type="single"` for one choice (like a segmented control) or `type="multiple"`. Arrow keys move between items. */
export const ToggleGroup = forwardRef<ElementRef<typeof RadixToggleGroup.Root>, ComponentPropsWithoutRef<typeof RadixToggleGroup.Root>>(function ToggleGroup({className, ...rest}, ref) {
  return <RadixToggleGroup.Root ref={ref} className={cx('toggle-group', className)} {...rest} />;
});
export const ToggleGroupItem = forwardRef<ElementRef<typeof RadixToggleGroup.Item>, ComponentPropsWithoutRef<typeof RadixToggleGroup.Item>>(function ToggleGroupItem({className, ...rest}, ref) {
  return <RadixToggleGroup.Item ref={ref} className={cx('toggle', className)} {...rest} />;
});
