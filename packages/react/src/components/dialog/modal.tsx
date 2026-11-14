'use client';
import {createContext, forwardRef, useContext, useEffect, useId, useRef, useState, type ButtonHTMLAttributes, type DialogHTMLAttributes, type HTMLAttributes, type PointerEvent, type ReactNode} from 'react';
import {Slot} from '../../utils/slot';
import {useControllableState} from '../../hooks/use-controllable-state';
import {TABBABLE, setRefs, vetoed} from '../../utils/overlay';

/* The native-<dialog> core behind Dialog, AlertDialog, Drawer and Command. showModal() gives the focus trap,
   the inert page, Escape and the top layer for free; this file adds controlled state, the Radix-style parts,
   focus return, backdrop click and the aria ids. Scroll lock and the backdrop are CSS (dialog.css). */

interface Ctx { open: boolean; setOpen: (o: boolean) => void; modal: boolean; contentId: string; titleId: string; descId: string; hasDesc: boolean; setHasDesc: (v: boolean) => void }
const Context = createContext<Ctx>(null as never);

export interface ModalProps {
  /** Controlled open state. */
  open?: boolean;
  /** Initial open state when uncontrolled. Default false. */
  defaultOpen?: boolean;
  /** Called with the next open state when the user opens or dismisses it. */
  onOpenChange?: (open: boolean) => void;
  /** `false` opens it as a non-modal dialog: no backdrop, no focus trap, page stays interactive. Default true. */
  modal?: boolean;
  /** The parts of the dialog: a trigger and its content. */
  children?: ReactNode;
}

/** Internal: holds the open state for Dialog, Drawer and AlertDialog (`open`, `defaultOpen`, `onOpenChange`, `modal`). */
export function Modal({open, defaultOpen = false, onOpenChange, modal = true, children}: ModalProps) {
  const [isOpen, setOpen] = useControllableState({value: open, defaultValue: defaultOpen, onChange: onOpenChange});
  const [hasDesc, setHasDesc] = useState(false);
  const id = useId();
  return <Context.Provider value={{open: isOpen, setOpen, modal, contentId: id, titleId: id + 't', descId: id + 'd', hasDesc, setHasDesc}}>{children}</Context.Provider>;
}

export interface ModalButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Render your own element instead of a button; it receives the props and the click handler. */
  asChild?: boolean;
}

/** Internal: the opener behind DialogTrigger, DrawerTrigger and AlertDialogTrigger. */
export const ModalTrigger = forwardRef<HTMLButtonElement, ModalButtonProps>(function ModalTrigger({asChild, onClick, ...rest}, ref) {
  const c = useContext(Context);
  const Comp = asChild ? Slot : 'button';
  return <Comp ref={ref} type={asChild ? undefined : 'button'} aria-haspopup="dialog" aria-expanded={c.open} aria-controls={c.open ? c.contentId : undefined} data-state={c.open ? 'open' : 'closed'} {...rest} onClick={(e: React.MouseEvent<HTMLButtonElement>) => { onClick?.(e); if (!e.defaultPrevented) c.setOpen(!c.open); }} />;
});

/** Internal: the closer behind DialogClose, DrawerClose and the alert dialog buttons. */
export const ModalClose = forwardRef<HTMLButtonElement, ModalButtonProps>(function ModalClose({asChild, onClick, ...rest}, ref) {
  const c = useContext(Context);
  const Comp = asChild ? Slot : 'button';
  return <Comp ref={ref} type={asChild ? undefined : 'button'} {...rest} onClick={(e: React.MouseEvent<HTMLButtonElement>) => { onClick?.(e); if (!e.defaultPrevented) c.setOpen(false); }} />;
});

export interface ModalContentProps extends Omit<DialogHTMLAttributes<HTMLDialogElement>, 'open'> {
  /** Called when Escape is pressed; call `event.preventDefault()` to keep it open. */
  onEscapeKeyDown?: (event: Event) => void;
  /** Called when the backdrop is pressed; call `event.preventDefault()` to keep it open. */
  onPointerDownOutside?: (event: Event) => void;
  /** Called after it opens, before focus moves to the element marked `data-autofocus`; `preventDefault()` skips that move. */
  onOpenAutoFocus?: (event: Event) => void;
  /** Called after it closes, before focus returns to the opener; `preventDefault()` lets you move focus yourself. */
  onCloseAutoFocus?: (event: Event) => void;
  /** Whether pressing the backdrop closes it. Default true. */
  dismissOnOutside?: boolean;
}


const Panel = forwardRef<HTMLDialogElement, ModalContentProps>(function Panel({onEscapeKeyDown, onPointerDownOutside, onOpenAutoFocus, onCloseAutoFocus, dismissOnOutside = true, onPointerDown, onClick, onKeyDown, children, ...rest}, forwarded) {
  const c = useContext(Context);
  const el = useRef<HTMLDialogElement | null>(null);
  const hooks = useRef({onOpenAutoFocus, onCloseAutoFocus});
  hooks.current = {onOpenAutoFocus, onCloseAutoFocus};
  const armed = useRef(false);
  // Mounted only while open, so this runs once per opening (and twice under StrictMode, which the cleanup survives).
  useEffect(() => {
    const d = el.current!, prev = document.activeElement as HTMLElement | null;
    if (c.modal) d.showModal(); else d.show();
    if (!vetoed(hooks.current.onOpenAutoFocus, d)) d.querySelector<HTMLElement>('[data-autofocus]')?.focus();
    return () => {
      d.close();
      if (!vetoed(hooks.current.onCloseAutoFocus, d)) prev?.focus();
    };
  }, []);
  const outside = (e: PointerEvent | React.MouseEvent) => { const r = (e.currentTarget as HTMLElement).getBoundingClientRect(); return e.target === e.currentTarget && (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom); };
  return (
    <dialog
      ref={(n) => setRefs(n, el, forwarded)}
      id={c.contentId}
      role="dialog"
      aria-modal={c.modal || undefined}
      aria-labelledby={c.titleId}
      aria-describedby={c.hasDesc ? c.descId : undefined}
      data-state="open"
      {...rest}
      onKeyDown={(e) => {
        onKeyDown?.(e);
        // Browsers let Tab leave a modal <dialog> for their own UI; keep it inside, and ignore keys from a nested dialog.
        if (e.key !== 'Tab' || e.defaultPrevented || (e.target as Element).closest('dialog') !== e.currentTarget) return;
        const t = [...e.currentTarget.querySelectorAll<HTMLElement>(TABBABLE)], edge = t[e.shiftKey ? 0 : t.length - 1];
        if (!t.length || document.activeElement === edge || document.activeElement === e.currentTarget) { e.preventDefault(); (e.shiftKey ? t[t.length - 1] : t[0])?.focus(); }
      }}
      onCancel={(e) => { e.preventDefault(); if (!vetoed(onEscapeKeyDown, e.currentTarget)) c.setOpen(false); }}
      onPointerDown={(e) => { armed.current = dismissOnOutside && outside(e) && !vetoed(onPointerDownOutside, e.currentTarget); onPointerDown?.(e); }}
      onClick={(e) => { if (armed.current && outside(e)) c.setOpen(false); armed.current = false; onClick?.(e); }}
    >
      {children}
    </dialog>
  );
});

/** Internal: the native `<dialog>` panel behind every modal component. Renders nothing while closed. */
export const ModalContent = forwardRef<HTMLDialogElement, ModalContentProps>(function ModalContent(props, ref) {
  return useContext(Context).open ? <Panel ref={ref} {...props} /> : null;
});

/** Internal: the heading that names the dialog (`aria-labelledby`). */
export const ModalTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(function ModalTitle(props, ref) {
  return <h2 ref={ref} id={useContext(Context).titleId} {...props} />;
});

/** Internal: the sentence that describes the dialog (`aria-describedby`, set only while rendered). */
export const ModalDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(function ModalDescription(props, ref) {
  const {descId, setHasDesc} = useContext(Context);
  useEffect(() => { setHasDesc(true); return () => setHasDesc(false); }, [setHasDesc]);
  return <p ref={ref} id={descId} {...props} />;
});
