import {forwardRef, type ComponentPropsWithoutRef, type ElementRef} from 'react';
import {AspectRatio as RadixAspectRatio} from 'radix-ui';

export type AspectRatioProps = ComponentPropsWithoutRef<typeof RadixAspectRatio.Root>;

/** Width / height ratio: `<AspectRatio ratio={16 / 9}>`. */
export const AspectRatio = forwardRef<ElementRef<typeof RadixAspectRatio.Root>, AspectRatioProps>(function AspectRatio(props, ref) {
  return <RadixAspectRatio.Root ref={ref} {...props} />;
});
