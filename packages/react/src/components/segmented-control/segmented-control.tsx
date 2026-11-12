'use client';
import {forwardRef, useState, type ComponentPropsWithoutRef, type ElementRef, type ReactNode} from 'react';
import {ToggleGroup as Radix} from 'radix-ui';
import {cx} from '../../utils/cx';

export interface SegmentedOption {
  value: string;
  label: ReactNode;
  disabled?: boolean;
}

export interface SegmentedControlProps extends Omit<ComponentPropsWithoutRef<typeof Radix.Root>, 'type' | 'value' | 'defaultValue' | 'onValueChange' | 'children' | 'dir'> {
  /** The segments to show, each with a `value`, a `label` and an optional `disabled`. */
  options: SegmentedOption[];
  /** The selected segment's `value` when controlled. Pair with `onValueChange`. */
  value?: string;
  /** The segment selected at first when uncontrolled. Defaults to the first option. */
  defaultValue?: string;
  /** Called with the new segment's `value` when the user picks a different one. */
  onValueChange?: (value: string) => void;
  /** Names the control, for example "View". */
  'aria-label': string;
}

/** A single choice among a few options. Unlike ToggleGroup it can never be empty. */
export const SegmentedControl = forwardRef<ElementRef<typeof Radix.Root>, SegmentedControlProps>(function SegmentedControl({options, value, defaultValue, onValueChange, className, ...rest}, ref) {
  const [inner, setInner] = useState(defaultValue ?? options[0]?.value ?? '');
  const current = value ?? inner;
  return (
    <Radix.Root
      ref={ref}
      type="single"
      className={cx('segmented', className)}
      value={current}
      onValueChange={(v) => { if (!v) return; if (value === undefined) setInner(v); onValueChange?.(v); }}
      {...rest}
    >
      {options.map((o) => <Radix.Item key={o.value} value={o.value} disabled={o.disabled} className="segment">{o.label}</Radix.Item>)}
    </Radix.Root>
  );
});
