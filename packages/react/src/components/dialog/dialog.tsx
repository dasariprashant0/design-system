import {forwardRef, type ComponentPropsWithoutRef, type ElementRef, type HTMLAttributes} from 'react';
import {Dialog as RadixDialog} from 'radix-ui';
import {cx} from '../../utils/cx';

export const Dialog = RadixDialog.Root;
export const DialogTrigger = RadixDialog.Trigger;
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

export const DialogHeader = ({className, ...rest}: HTMLAttributes<HTMLDivElement>) => <div className={cx('dialog-header', className)} {...rest} />;
export const DialogFooter = ({className, ...rest}: HTMLAttributes<HTMLDivElement>) => <div className={cx('dialog-footer', className)} {...rest} />;

export const DialogTitle = forwardRef<ElementRef<typeof RadixDialog.Title>, ComponentPropsWithoutRef<typeof RadixDialog.Title>>(function DialogTitle({className, ...rest}, ref) {
  return <RadixDialog.Title ref={ref} className={cx('dialog-title', className)} {...rest} />;
});
export const DialogDescription = forwardRef<ElementRef<typeof RadixDialog.Description>, ComponentPropsWithoutRef<typeof RadixDialog.Description>>(function DialogDescription({className, ...rest}, ref) {
  return <RadixDialog.Description ref={ref} className={cx('dialog-description', className)} {...rest} />;
});
