import {forwardRef, type ComponentPropsWithoutRef, type ElementRef, type HTMLAttributes} from 'react';
import {AlertDialog as Radix} from 'radix-ui';
import {cx} from '../../utils/cx';

/** The root of a confirmation dialog that must be answered. Holds the open state; put `AlertDialogTrigger` and `AlertDialogContent` inside. Unlike `Dialog` it cannot be dismissed by clicking outside. */
export const AlertDialog = Radix.Root;
/** The element (usually a `Button`) that opens the alert dialog; use `asChild` to render your own element. */
export const AlertDialogTrigger = Radix.Trigger;

/** The panel with its overlay. Always include a title and description. */
export const AlertDialogContent = forwardRef<ElementRef<typeof Radix.Content>, ComponentPropsWithoutRef<typeof Radix.Content>>(function AlertDialogContent({className, ...rest}, ref) {
  return (
    <Radix.Portal>
      <Radix.Overlay className="dialog-overlay" />
      <Radix.Content ref={ref} className={cx('dialog-content', className)} {...rest} />
    </Radix.Portal>
  );
});

/** Wrapper for the title and description at the top of the dialog. */
export const AlertDialogHeader = ({className, ...rest}: HTMLAttributes<HTMLDivElement>) => <div className={cx('dialog-header', className)} {...rest} />;
/** Wrapper for the action buttons at the bottom of the dialog (usually `AlertDialogCancel` then `AlertDialogAction`). */
export const AlertDialogFooter = ({className, ...rest}: HTMLAttributes<HTMLDivElement>) => <div className={cx('dialog-footer', className)} {...rest} />;

/** The dialog's accessible name, rendered as the heading. Required. */
export const AlertDialogTitle = forwardRef<ElementRef<typeof Radix.Title>, ComponentPropsWithoutRef<typeof Radix.Title>>(function AlertDialogTitle({className, ...rest}, ref) {
  return <Radix.Title ref={ref} className={cx('dialog-title', className)} {...rest} />;
});
/** Explains what will happen if the user confirms; read out when the dialog opens. Required. */
export const AlertDialogDescription = forwardRef<ElementRef<typeof Radix.Description>, ComponentPropsWithoutRef<typeof Radix.Description>>(function AlertDialogDescription({className, ...rest}, ref) {
  return <Radix.Description ref={ref} className={cx('dialog-description', className)} {...rest} />;
});

/** Confirms. Styled as the danger button by default; pass `className="btn-solid"` for a non-destructive confirm. */
export const AlertDialogAction = forwardRef<ElementRef<typeof Radix.Action>, ComponentPropsWithoutRef<typeof Radix.Action>>(function AlertDialogAction({className, ...rest}, ref) {
  return <Radix.Action ref={ref} className={cx('btn btn-danger', className)} {...rest} />;
});
/** Cancels. Receives focus first so Enter never confirms by accident. */
export const AlertDialogCancel = forwardRef<ElementRef<typeof Radix.Cancel>, ComponentPropsWithoutRef<typeof Radix.Cancel>>(function AlertDialogCancel({className, ...rest}, ref) {
  return <Radix.Cancel ref={ref} className={cx('btn btn-line', className)} {...rest} />;
});
