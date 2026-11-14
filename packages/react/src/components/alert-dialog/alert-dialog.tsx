import {forwardRef, type ButtonHTMLAttributes, type HTMLAttributes} from 'react';
import {cx} from '../../utils/cx';
import {Modal, ModalClose, ModalContent, ModalDescription, ModalTitle, ModalTrigger, type ModalContentProps} from '../dialog/modal';

/** The root of a confirmation dialog that must be answered, built on the native `<dialog>` element. Holds the open state; put `AlertDialogTrigger` and `AlertDialogContent` inside. Unlike `Dialog` it cannot be dismissed by clicking outside. */
export const AlertDialog = Modal;
/** The element (usually a `Button`) that opens the alert dialog; use `asChild` to render your own element. */
export const AlertDialogTrigger = ModalTrigger;

/** The panel (`role="alertdialog"`, opened with `showModal()`). Always include a title and description. Escape cancels; clicking outside does not. */
export const AlertDialogContent = forwardRef<HTMLDialogElement, Omit<ModalContentProps, 'dismissOnOutside'>>(function AlertDialogContent({className, ...rest}, ref) {
  return <ModalContent ref={ref} role="alertdialog" dismissOnOutside={false} className={cx('dialog-content', className)} {...rest} />;
});

/** Wrapper for the title and description at the top of the dialog. */
export const AlertDialogHeader = ({className, ...rest}: HTMLAttributes<HTMLDivElement>) => <div className={cx('dialog-header', className)} {...rest} />;
/** Wrapper for the action buttons at the bottom of the dialog (usually `AlertDialogCancel` then `AlertDialogAction`). */
export const AlertDialogFooter = ({className, ...rest}: HTMLAttributes<HTMLDivElement>) => <div className={cx('dialog-footer', className)} {...rest} />;

/** The dialog's accessible name, rendered as the heading. Required. */
export const AlertDialogTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(function AlertDialogTitle({className, ...rest}, ref) {
  return <ModalTitle ref={ref} className={cx('dialog-title', className)} {...rest} />;
});
/** Explains what will happen if the user confirms; read out when the dialog opens. Required. */
export const AlertDialogDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(function AlertDialogDescription({className, ...rest}, ref) {
  return <ModalDescription ref={ref} className={cx('dialog-description', className)} {...rest} />;
});

type ActionProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Render your own element instead of a button. */
  asChild?: boolean;
};

/** Confirms and closes. Styled as the danger button by default; pass `className="btn-solid"` for a non-destructive confirm. */
export const AlertDialogAction = forwardRef<HTMLButtonElement, ActionProps>(function AlertDialogAction({className, ...rest}, ref) {
  return <ModalClose ref={ref} className={cx('btn btn-danger', className)} {...rest} />;
});
/** Cancels and closes. Receives focus first so Enter never confirms by accident. */
export const AlertDialogCancel = forwardRef<HTMLButtonElement, ActionProps>(function AlertDialogCancel({className, ...rest}, ref) {
  return <ModalClose ref={ref} data-autofocus="" className={cx('btn btn-line', className)} {...rest} />;
});
