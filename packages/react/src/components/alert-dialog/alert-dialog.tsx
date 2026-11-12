import {forwardRef, type ComponentPropsWithoutRef, type ElementRef, type HTMLAttributes} from 'react';
import {AlertDialog as Radix} from 'radix-ui';
import {cx} from '../../utils/cx';

export const AlertDialog = Radix.Root;
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

export const AlertDialogHeader = ({className, ...rest}: HTMLAttributes<HTMLDivElement>) => <div className={cx('dialog-header', className)} {...rest} />;
export const AlertDialogFooter = ({className, ...rest}: HTMLAttributes<HTMLDivElement>) => <div className={cx('dialog-footer', className)} {...rest} />;

export const AlertDialogTitle = forwardRef<ElementRef<typeof Radix.Title>, ComponentPropsWithoutRef<typeof Radix.Title>>(function AlertDialogTitle({className, ...rest}, ref) {
  return <Radix.Title ref={ref} className={cx('dialog-title', className)} {...rest} />;
});
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
