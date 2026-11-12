import {Direction} from 'radix-ui';

/**
 * Returns `isRtl(element)` for custom widgets that read ArrowLeft/ArrowRight themselves.
 * The nearest `dir` attribute wins; otherwise a `DirectionProvider` value, then the computed CSS direction.
 */
export function useIsRtl() {
  const ctx = Direction.useDirection();
  return (el: Element | null | undefined): boolean => {
    const d = el?.closest('[dir]')?.getAttribute('dir');
    if (d === 'rtl' || d === 'ltr') return d === 'rtl';
    return ctx === 'rtl' || (!!el && getComputedStyle(el).direction === 'rtl');
  };
}
