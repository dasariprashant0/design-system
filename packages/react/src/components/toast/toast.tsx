import {forwardRef, type ComponentPropsWithoutRef, type ElementRef} from 'react';
import {Toast as Radix} from 'radix-ui';
import {cx} from '../../utils/cx';

/** Wrap the app once. `duration` is in ms; `label` names the region for assistive tech. */
export const ToastProvider = Radix.Provider;

/** Where toasts appear on screen. Render it once inside `ToastProvider`. */
export const ToastViewport = forwardRef<ElementRef<typeof Radix.Viewport>, ComponentPropsWithoutRef<typeof Radix.Viewport>>(function ToastViewport({className, ...rest}, ref) {
  return <Radix.Viewport ref={ref} className={cx('toast-viewport', className)} {...rest} />;
});

/** One message. Control it with `open` / `onOpenChange`. */
export const Toast = forwardRef<ElementRef<typeof Radix.Root>, ComponentPropsWithoutRef<typeof Radix.Root>>(function Toast({className, ...rest}, ref) {
  return <Radix.Root ref={ref} className={cx('toast-item', className)} {...rest} />;
});
/** The toast's short headline. */
export const ToastTitle = forwardRef<ElementRef<typeof Radix.Title>, ComponentPropsWithoutRef<typeof Radix.Title>>(function ToastTitle({className, ...rest}, ref) {
  return <Radix.Title ref={ref} className={cx('toast-title', className)} {...rest} />;
});
/** The toast's longer explanation. */
export const ToastDescription = forwardRef<ElementRef<typeof Radix.Description>, ComponentPropsWithoutRef<typeof Radix.Description>>(function ToastDescription({className, ...rest}, ref) {
  return <Radix.Description ref={ref} className={cx('toast-description', className)} {...rest} />;
});
/** An undo or retry. `altText` describes it for people who miss the toast. */
export const ToastAction = forwardRef<ElementRef<typeof Radix.Action>, ComponentPropsWithoutRef<typeof Radix.Action>>(function ToastAction({className, ...rest}, ref) {
  return <Radix.Action ref={ref} className={cx('toast-action', className)} {...rest} />;
});
/** The dismiss button; its text defaults to "Dismiss". */
export const ToastClose = forwardRef<ElementRef<typeof Radix.Close>, ComponentPropsWithoutRef<typeof Radix.Close>>(function ToastClose({className, children = 'Dismiss', ...rest}, ref) {
  return <Radix.Close ref={ref} className={cx('toast-close', className)} {...rest}>{children}</Radix.Close>;
});
