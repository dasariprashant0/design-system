import {forwardRef, type ComponentPropsWithoutRef, type ElementRef} from 'react';
import {Select as RadixSelect} from 'radix-ui';
import {cx} from '../../utils/cx';
import {useFieldControl} from '../field';

/** The root of a custom single-choice dropdown. Use `value` and `onValueChange` (or `defaultValue`); put a `SelectTrigger` and `SelectContent` inside. For a plain list prefer `NativeSelect`. */
export const Select = RadixSelect.Root;
/** Groups related `SelectItem`s, optionally under a `SelectLabel`. */
export const SelectGroup = RadixSelect.Group;
/** Shows the chosen item's text inside the `SelectTrigger`; `placeholder` appears while nothing is chosen. */
export const SelectValue = RadixSelect.Value;

export interface SelectTriggerProps extends ComponentPropsWithoutRef<typeof RadixSelect.Trigger> {
  /** Marks the control invalid (`aria-invalid`). A surrounding Field sets this from its `error`. */
  invalid?: boolean;
}
/** The button that shows the chosen value. Inside a Field it is labelled and described automatically. */
export const SelectTrigger = forwardRef<ElementRef<typeof RadixSelect.Trigger>, SelectTriggerProps>(function SelectTrigger({className, invalid, children, id, ...rest}, ref) {
  const f = useFieldControl();
  return (
    <RadixSelect.Trigger ref={ref} id={id ?? f.id} aria-describedby={f['aria-describedby']} aria-invalid={invalid || f['aria-invalid']} className={cx('select-trigger', className)} {...rest}>
      {children}
    </RadixSelect.Trigger>
  );
});

/** The floating list of options, rendered in a portal and positioned under the trigger. */
export const SelectContent = forwardRef<ElementRef<typeof RadixSelect.Content>, ComponentPropsWithoutRef<typeof RadixSelect.Content>>(function SelectContent({className, children, position = 'popper', sideOffset = 4, ...rest}, ref) {
  return (
    <RadixSelect.Portal>
      <RadixSelect.Content ref={ref} position={position} sideOffset={sideOffset} className={cx('select-content', className)} {...rest}>
        <RadixSelect.Viewport className="select-viewport">{children}</RadixSelect.Viewport>
      </RadixSelect.Content>
    </RadixSelect.Portal>
  );
});

/** One choice in the list; give it a `value` and the visible text as children. */
export const SelectItem = forwardRef<ElementRef<typeof RadixSelect.Item>, ComponentPropsWithoutRef<typeof RadixSelect.Item>>(function SelectItem({className, children, ...rest}, ref) {
  return (
    <RadixSelect.Item ref={ref} className={cx('select-item', className)} {...rest}>
      <RadixSelect.ItemText>{children}</RadixSelect.ItemText>
      <RadixSelect.ItemIndicator>✓</RadixSelect.ItemIndicator>
    </RadixSelect.Item>
  );
});

/** A non-interactive heading for a `SelectGroup`. */
export const SelectLabel = forwardRef<ElementRef<typeof RadixSelect.Label>, ComponentPropsWithoutRef<typeof RadixSelect.Label>>(function SelectLabel({className, ...rest}, ref) {
  return <RadixSelect.Label ref={ref} className={cx('select-label', className)} {...rest} />;
});
