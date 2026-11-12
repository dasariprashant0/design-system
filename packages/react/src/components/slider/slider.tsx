import {forwardRef, type ComponentPropsWithoutRef, type ElementRef} from 'react';
import {Slider as RadixSlider} from 'radix-ui';
import {cx} from '../../utils/cx';

export interface SliderProps extends Omit<ComponentPropsWithoutRef<typeof RadixSlider.Root>, 'value' | 'defaultValue' | 'onValueChange'> {
  /** A number for one thumb, or [low, high] for a range. */
  value?: number | [number, number];
  /** The starting value when uncontrolled: a number for one thumb or `[low, high]` for a range. Default 0. */
  defaultValue?: number | [number, number];
  /** Called with an array holding the value of each thumb while the user drags or uses the keyboard. */
  onValueChange?: (value: number[]) => void;
  /** Accessible name for each thumb. One string for a single thumb, or [low, high] labels for a range. */
  'aria-label': string;
}

const arr = (v: number | [number, number] | undefined) => (v === undefined ? undefined : Array.isArray(v) ? v : [v]);

/** One thumb or two. Arrow keys step, Home and End jump to the ends, PageUp and PageDown take larger steps. */
export const Slider = forwardRef<ElementRef<typeof RadixSlider.Root>, SliderProps>(function Slider({value, defaultValue, className, 'aria-label': label, ...rest}, ref) {
  const v = arr(value), d = arr(defaultValue) ?? (v ? undefined : [0]);
  const count = (v ?? d ?? [0]).length;
  return (
    <RadixSlider.Root ref={ref} value={v} defaultValue={d} className={cx('slider', className)} {...rest}>
      <RadixSlider.Track className="slider-track"><RadixSlider.Range className="slider-range" /></RadixSlider.Track>
      {Array.from({length: count}, (_, i) => (
        <RadixSlider.Thumb key={i} className="slider-thumb" aria-label={count > 1 ? `${label} ${i === 0 ? 'minimum' : 'maximum'}` : label} />
      ))}
    </RadixSlider.Root>
  );
});
