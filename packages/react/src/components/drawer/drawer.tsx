import {forwardRef, type ComponentPropsWithoutRef, type ElementRef, type HTMLAttributes} from 'react';
import {Dialog as Radix} from 'radix-ui';
import {cx} from '../../utils/cx';

export const Drawer = Radix.Root;
export const DrawerTrigger = Radix.Trigger;
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

export const DrawerHeader = ({className, ...rest}: HTMLAttributes<HTMLDivElement>) => <div className={cx('dialog-header', className)} {...rest} />;
export const DrawerFooter = ({className, ...rest}: HTMLAttributes<HTMLDivElement>) => <div className={cx('dialog-footer', className)} {...rest} />;
export const DrawerTitle = forwardRef<ElementRef<typeof Radix.Title>, ComponentPropsWithoutRef<typeof Radix.Title>>(function DrawerTitle({className, ...rest}, ref) {
  return <Radix.Title ref={ref} className={cx('dialog-title', className)} {...rest} />;
});
export const DrawerDescription = forwardRef<ElementRef<typeof Radix.Description>, ComponentPropsWithoutRef<typeof Radix.Description>>(function DrawerDescription({className, ...rest}, ref) {
  return <Radix.Description ref={ref} className={cx('dialog-description', className)} {...rest} />;
});
