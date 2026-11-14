import {forwardRef, type HTMLAttributes} from 'react';
import {cx} from '../../utils/cx';
import {Modal, ModalClose, ModalContent, ModalDescription, ModalTitle, ModalTrigger, type ModalContentProps} from './modal';

/** The root of a modal dialog, built on the native `<dialog>` element. Holds the open state (`open`, `defaultOpen`, `onOpenChange`); put a `DialogTrigger` and `DialogContent` inside. */
export const Dialog = Modal;
/** The element (usually a `Button`) that opens the dialog; use `asChild` to render your own element. */
export const DialogTrigger = ModalTrigger;
/** An element that closes the dialog when activated; use `asChild` to wrap your own button. */
export const DialogClose = ModalClose;

export interface DialogContentProps extends ModalContentProps {
  /** Shows a "Close" text button in the corner. Escape and the backdrop always close it. */
  showClose?: boolean;
}

/** The dialog panel (a native `<dialog>` opened with `showModal()`, so focus is trapped and the page behind is inert). Include a DialogTitle (required for assistive tech) and ideally a DialogDescription. */
export const DialogContent = forwardRef<HTMLDialogElement, DialogContentProps>(function DialogContent({className, children, showClose = true, ...rest}, ref) {
  return (
    <ModalContent ref={ref} className={cx('dialog-content', className)} {...rest}>
      {children}
      {showClose && <ModalClose className="dialog-close">Close</ModalClose>}
    </ModalContent>
  );
});

/** Wrapper for the title and description at the top of the dialog. */
export const DialogHeader = ({className, ...rest}: HTMLAttributes<HTMLDivElement>) => <div className={cx('dialog-header', className)} {...rest} />;
/** Wrapper for the action buttons at the bottom of the dialog. */
export const DialogFooter = ({className, ...rest}: HTMLAttributes<HTMLDivElement>) => <div className={cx('dialog-footer', className)} {...rest} />;

/** The dialog's accessible name, rendered as the heading. Required. */
export const DialogTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(function DialogTitle({className, ...rest}, ref) {
  return <ModalTitle ref={ref} className={cx('dialog-title', className)} {...rest} />;
});
/** A sentence explaining the dialog, read out when it opens. Recommended. */
export const DialogDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(function DialogDescription({className, ...rest}, ref) {
  return <ModalDescription ref={ref} className={cx('dialog-description', className)} {...rest} />;
});
