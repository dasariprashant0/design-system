import {forwardRef, type ComponentPropsWithoutRef, type ElementRef} from 'react';
import {ScrollArea as Radix} from 'radix-ui';
import {cx} from '../../utils/cx';

export interface ScrollAreaProps extends ComponentPropsWithoutRef<typeof Radix.Root> {
  /** Which scrollbars to render. */
  orientation?: 'vertical' | 'horizontal' | 'both';
  /** Passed to the focusable viewport, e.g. a name for the region. */
  viewportProps?: ComponentPropsWithoutRef<typeof Radix.Viewport>;
}

/** Give it a height or width; content that overflows scrolls. */
export const ScrollArea = forwardRef<ElementRef<typeof Radix.Root>, ScrollAreaProps>(function ScrollArea({orientation = 'vertical', viewportProps, className, children, ...rest}, ref) {
  return (
    <Radix.Root ref={ref} className={cx('scroll-area', className)} {...rest}>
      <Radix.Viewport tabIndex={0} className="scroll-viewport" {...viewportProps}>{children}</Radix.Viewport>
      {orientation !== 'horizontal' && <Radix.Scrollbar orientation="vertical" className="scroll-bar"><Radix.Thumb className="scroll-thumb" /></Radix.Scrollbar>}
      {orientation !== 'vertical' && <Radix.Scrollbar orientation="horizontal" className="scroll-bar"><Radix.Thumb className="scroll-thumb" /></Radix.Scrollbar>}
    </Radix.Root>
  );
});
