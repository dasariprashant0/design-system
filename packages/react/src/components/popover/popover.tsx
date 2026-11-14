'use client';
import {createContext, forwardRef, useContext, useEffect, useId, useRef, type ButtonHTMLAttributes, type HTMLAttributes, type MouseEvent, type ReactNode, type RefObject} from 'react';
import {Slot} from '../../utils/slot';
import {useControllableState} from '../../hooks/use-controllable-state';
import {cx} from '../../utils/cx';
import {TABBABLE, setRefs, vetoed} from '../../utils/overlay';
import {Floating, useDismiss, useHydrated, type Placement} from './float';

interface Ctx { open: boolean; setOpen: (o: boolean) => void; contentId: string; trigger: RefObject<HTMLElement | null>; anchor: RefObject<HTMLElement | null> }
const Context = createContext<Ctx>(null as never);

export interface PopoverProps {
  /** Controlled open state. */
  open?: boolean;
  /** Initial open state when uncontrolled. Default false. */
  defaultOpen?: boolean;
  /** Called with the next open state when the user opens or dismisses it. */
  onOpenChange?: (open: boolean) => void;
  /** The parts of the component: a trigger and its content. */
  children?: ReactNode;
}

/** The root of a floating panel. Holds the open state (`open`, `defaultOpen`, `onOpenChange`); put a `PopoverTrigger` and `PopoverContent` inside. */
export function Popover({open, defaultOpen = false, onOpenChange, children}: PopoverProps) {
  const [isOpen, setOpen] = useControllableState({value: open, defaultValue: defaultOpen, onChange: onOpenChange});
  const trigger = useRef<HTMLElement | null>(null), anchor = useRef<HTMLElement | null>(null);
  return <Context.Provider value={{open: isOpen, setOpen, contentId: useId(), trigger, anchor}}>{children}</Context.Provider>;
}

interface AsChild { /** Render your own element instead of the default; it receives the props and handlers. */ asChild?: boolean }

/** The element (usually a `Button`) that toggles the popover; use `asChild` to render your own element. */
export const PopoverTrigger = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & AsChild>(function PopoverTrigger({asChild, onClick, ...rest}, ref) {
  const c = useContext(Context);
  const Comp = asChild ? Slot : 'button';
  return <Comp ref={(n: HTMLButtonElement | null) => setRefs(n, c.trigger, ref)} type={asChild ? undefined : 'button'} aria-haspopup="dialog" aria-expanded={c.open} aria-controls={c.open ? c.contentId : undefined} data-state={c.open ? 'open' : 'closed'} {...rest} onClick={(e: MouseEvent<HTMLButtonElement>) => { onClick?.(e); if (!e.defaultPrevented) c.setOpen(!c.open); }} />;
});

/** Positions the popover against this element instead of the trigger. */
export const PopoverAnchor = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement> & AsChild>(function PopoverAnchor({asChild, ...rest}, ref) {
  const c = useContext(Context);
  const Comp = asChild ? Slot : 'div';
  return <Comp ref={(n: HTMLDivElement | null) => setRefs(n, c.anchor, ref)} {...rest} />;
});

/** An element that closes the popover when activated; use `asChild` to wrap your own button. */
export const PopoverClose = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & AsChild>(function PopoverClose({asChild, onClick, ...rest}, ref) {
  const c = useContext(Context);
  const Comp = asChild ? Slot : 'button';
  return <Comp ref={ref} type={asChild ? undefined : 'button'} {...rest} onClick={(e: MouseEvent<HTMLButtonElement>) => { onClick?.(e); if (!e.defaultPrevented) c.setOpen(false); }} />;
});

export interface PopoverContentProps extends HTMLAttributes<HTMLDivElement>, Placement {
  /** Called when Escape is pressed; call `event.preventDefault()` to keep it open. */
  onEscapeKeyDown?: (event: Event) => void;
  /** Called when a press or focus lands outside; call `event.preventDefault()` to keep it open. */
  onInteractOutside?: (event: Event) => void;
  /** Called after it opens, before focus moves in; `preventDefault()` keeps focus where it is or lets you move it yourself. */
  onOpenAutoFocus?: (event: Event) => void;
  /** Called after it closes, before focus returns to the trigger; `preventDefault()` lets you move focus yourself. */
  onCloseAutoFocus?: (event: Event) => void;
}

const Panel = forwardRef<HTMLDivElement, PopoverContentProps>(function Panel({className, sideOffset = 8, align = 'start', side, onEscapeKeyDown, onInteractOutside, onOpenAutoFocus, onCloseAutoFocus, ...rest}, forwarded) {
  const c = useContext(Context);
  const el = useRef<HTMLDivElement | null>(null);
  const outside = useRef(false);
  const hooks = useRef({onOpenAutoFocus, onCloseAutoFocus});
  hooks.current = {onOpenAutoFocus, onCloseAutoFocus};
  useDismiss(true, [el, c.trigger, c.anchor], (kind) => {
    if (vetoed(kind === 'escape' ? onEscapeKeyDown : onInteractOutside, el.current!)) return;
    outside.current = kind === 'outside';
    c.setOpen(false);
  });
  useEffect(() => {
    const p = el.current!;
    if (!vetoed(hooks.current.onOpenAutoFocus, p)) (p.querySelector<HTMLElement>(TABBABLE) ?? p).focus();
    return () => { if (!vetoed(hooks.current.onCloseAutoFocus, p) && !outside.current) c.trigger.current?.focus(); };
  }, []);
  return <Floating ref={(n) => setRefs(n, el, forwarded)} anchor={() => c.anchor.current ?? c.trigger.current} side={side} align={align} sideOffset={sideOffset} role="dialog" id={c.contentId} tabIndex={-1} data-state="open" className={cx('popover', className)} {...rest} />;
});

/** A floating panel anchored to its trigger, placed on the side with room. Focus moves in, Escape closes and returns focus to the trigger, a press outside closes it. */
export const PopoverContent = forwardRef<HTMLDivElement, PopoverContentProps>(function PopoverContent(props, ref) {
  const {open} = useContext(Context), hydrated = useHydrated();
  return open && hydrated ? <Panel ref={ref} {...props} /> : null;
});
