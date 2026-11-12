import {forwardRef, type ComponentPropsWithoutRef, type ElementRef, type ReactNode} from 'react';
import {Tooltip as RadixTooltip} from 'radix-ui';
import {cx} from '../../utils/cx';

/** Wrap your app (or a region) once. Sets the shared open delay. */
export const TooltipProvider = RadixTooltip.Provider;

export interface TooltipProps {
  /** The text shown. Keep it short; it repeats or extends a label and must never hold essential information alone. */
  content: ReactNode;
  /** The trigger element. It receives aria-describedby when open. */
  children: ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  delayDuration?: number;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * Hint text on hover and keyboard focus. Escape dismisses it.
 * @example <Tooltip content="Saved to ~/Notes"><Button>Save</Button></Tooltip>
 */
export function Tooltip({content, children, side = 'top', delayDuration, open, defaultOpen, onOpenChange}: TooltipProps) {
  return (
    <RadixTooltip.Root delayDuration={delayDuration} open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
      <RadixTooltip.Portal>
        <RadixTooltip.Content side={side} sideOffset={6} className="tooltip">{content}</RadixTooltip.Content>
      </RadixTooltip.Portal>
    </RadixTooltip.Root>
  );
}

export const TooltipContent = forwardRef<ElementRef<typeof RadixTooltip.Content>, ComponentPropsWithoutRef<typeof RadixTooltip.Content>>(function TooltipContent({className, sideOffset = 6, ...rest}, ref) {
  return <RadixTooltip.Content ref={ref} sideOffset={sideOffset} className={cx('tooltip', className)} {...rest} />;
});
