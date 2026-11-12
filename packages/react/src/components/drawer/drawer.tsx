import {forwardRef, type ComponentPropsWithoutRef, type ElementRef, type HTMLAttributes} from 'react';
import {Dialog as Radix} from 'radix-ui';
import {cx} from '../../utils/cx';

/** The root of a panel that slides in from an edge. Holds the open state (`open`, `defaultOpen`, `onOpenChange`); put a `DrawerTrigger` and `DrawerContent` inside. */
export const Drawer = Radix.Root;
/** The element (usually a `Button`) that opens the drawer; use `asChild` to render your own element. */
export const DrawerTrigger = Radix.Trigger;
/** An element that closes the drawer when activated; use `asChild` to wrap your own button. */
export const DrawerClose = Radix.Close;

export interface DrawerContentProps extends ComponentPropsWithoutRef<typeof Radix.Content> {
  /** The edge it slides from. */
  side?: 'right' | 'left' | 'top' | 'bottom';
  /** Shows a "Close" text button. Escape and the overlay always close it. */
  showClose?: boolean;
}

/** The panel with its overlay. Include a DrawerTitle. */
export const DrawerContent = forwardRef<ElementRef<typeof Radix.Content>, DrawerContentProps>(function DrawerContent({side = 'right', showClose = true, className, children, ...rest}, ref) {
  return (
    <Radix.Portal>
      <Radix.Overlay className="dialog-overlay" />
      <Radix.Content ref={ref} className={cx('drawer-content', className)} data-side={side} {...rest}>
        {children}
        {showClose && <Radix.Close className="dialog-close">Close</Radix.Close>}
      </Radix.Content>
    </Radix.Portal>
  );
});

/** Wrapper for the title and description at the top of the drawer. */
export const DrawerHeader = ({className, ...rest}: HTMLAttributes<HTMLDivElement>) => <div className={cx('dialog-header', className)} {...rest} />;
/** Wrapper for the action buttons at the bottom of the drawer. */
export const DrawerFooter = ({className, ...rest}: HTMLAttributes<HTMLDivElement>) => <div className={cx('dialog-footer', className)} {...rest} />;
/** The drawer's accessible name, rendered as the heading. Required. */
export const DrawerTitle = forwardRef<ElementRef<typeof Radix.Title>, ComponentPropsWithoutRef<typeof Radix.Title>>(function DrawerTitle({className, ...rest}, ref) {
  return <Radix.Title ref={ref} className={cx('dialog-title', className)} {...rest} />;
});
/** A sentence explaining the drawer, read out when it opens. Recommended. */
export const DrawerDescription = forwardRef<ElementRef<typeof Radix.Description>, ComponentPropsWithoutRef<typeof Radix.Description>>(function DrawerDescription({className, ...rest}, ref) {
  return <Radix.Description ref={ref} className={cx('dialog-description', className)} {...rest} />;
});
