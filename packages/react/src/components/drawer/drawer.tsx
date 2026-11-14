import {forwardRef, type HTMLAttributes} from 'react';
import {cx} from '../../utils/cx';
import {Modal, ModalClose, ModalContent, ModalDescription, ModalTitle, ModalTrigger, type ModalContentProps} from '../dialog/modal';

/** The root of a panel that slides in from an edge, built on the native `<dialog>` element. Holds the open state (`open`, `defaultOpen`, `onOpenChange`); put a `DrawerTrigger` and `DrawerContent` inside. */
export const Drawer = Modal;
/** The element (usually a `Button`) that opens the drawer; use `asChild` to render your own element. */
export const DrawerTrigger = ModalTrigger;
/** An element that closes the drawer when activated; use `asChild` to wrap your own button. */
export const DrawerClose = ModalClose;

export interface DrawerContentProps extends ModalContentProps {
  /** The edge it slides from. `start` and `end` follow the reading direction; `left` and `right` are fixed. */
  side?: 'right' | 'left' | 'top' | 'bottom' | 'start' | 'end';
  /** Shows a "Close" text button. Escape and the backdrop always close it. */
  showClose?: boolean;
}

/** The panel, opened as a modal `<dialog>` (focus trapped, page behind inert). Include a DrawerTitle. */
export const DrawerContent = forwardRef<HTMLDialogElement, DrawerContentProps>(function DrawerContent({side = 'right', showClose = true, className, children, ...rest}, ref) {
  return (
    <ModalContent ref={ref} className={cx('drawer-content', className)} data-side={side} {...rest}>
      {children}
      {showClose && <ModalClose className="dialog-close">Close</ModalClose>}
    </ModalContent>
  );
});

/** Wrapper for the title and description at the top of the drawer. */
export const DrawerHeader = ({className, ...rest}: HTMLAttributes<HTMLDivElement>) => <div className={cx('dialog-header', className)} {...rest} />;
/** Wrapper for the action buttons at the bottom of the drawer. */
export const DrawerFooter = ({className, ...rest}: HTMLAttributes<HTMLDivElement>) => <div className={cx('dialog-footer', className)} {...rest} />;
/** The drawer's accessible name, rendered as the heading. Required. */
export const DrawerTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(function DrawerTitle({className, ...rest}, ref) {
  return <ModalTitle ref={ref} className={cx('dialog-title', className)} {...rest} />;
});
/** A sentence explaining the drawer, read out when it opens. Recommended. */
export const DrawerDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(function DrawerDescription({className, ...rest}, ref) {
  return <ModalDescription ref={ref} className={cx('dialog-description', className)} {...rest} />;
});
