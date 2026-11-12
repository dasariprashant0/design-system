import {forwardRef, type ComponentPropsWithoutRef, type ElementRef, type HTMLAttributes} from 'react';
import {Dialog as RadixDialog} from 'radix-ui';
import {cx} from '../../utils/cx';

/** The root of a modal dialog. Holds the open state (`open`, `defaultOpen`, `onOpenChange`); put a `DialogTrigger` and `DialogContent` inside. */
export const Dialog = RadixDialog.Root;
/** The element (usually a `Button`) that opens the dialog; use `asChild` to render your own element. */
export const DialogTrigger = RadixDialog.Trigger;
/** An element that closes the dialog when activated; use `asChild` to wrap your own button. */
export const DialogClose = RadixDialog.Close;

export interface DialogContentProps extends ComponentPropsWithoutRef<typeof RadixDialog.Content> {
  /** Shows a "Close" text button in the corner. Escape and the overlay always close it. */
  showClose?: boolean;
}

/** The dialog panel with its overlay. Include a DialogTitle (required for assistive tech) and ideally a DialogDescription. */
export const DialogContent = forwardRef<ElementRef<typeof RadixDialog.Content>, DialogContentProps>(function DialogContent({className, children, showClose = true, ...rest}, ref) {
  return (
    <RadixDialog.Portal>
      <RadixDialog.Overlay className="dialog-overlay" />
      <RadixDialog.Content ref={ref} className={cx('dialog-content', className)} {...rest}>
        {children}
        {showClose && <RadixDialog.Close className="dialog-close">Close</RadixDialog.Close>}
      </RadixDialog.Content>
    </RadixDialog.Portal>
  );
});

/** Wrapper for the title and description at the top of the dialog. */
export const DialogHeader = ({className, ...rest}: HTMLAttributes<HTMLDivElement>) => <div className={cx('dialog-header', className)} {...rest} />;
/** Wrapper for the action buttons at the bottom of the dialog. */
export const DialogFooter = ({className, ...rest}: HTMLAttributes<HTMLDivElement>) => <div className={cx('dialog-footer', className)} {...rest} />;

/** The dialog's accessible name, rendered as the heading. Required. */
export const DialogTitle = forwardRef<ElementRef<typeof RadixDialog.Title>, ComponentPropsWithoutRef<typeof RadixDialog.Title>>(function DialogTitle({className, ...rest}, ref) {
  return <RadixDialog.Title ref={ref} className={cx('dialog-title', className)} {...rest} />;
});
/** A sentence explaining the dialog, read out when it opens. Recommended. */
export const DialogDescription = forwardRef<ElementRef<typeof RadixDialog.Description>, ComponentPropsWithoutRef<typeof RadixDialog.Description>>(function DialogDescription({className, ...rest}, ref) {
  return <RadixDialog.Description ref={ref} className={cx('dialog-description', className)} {...rest} />;
});
