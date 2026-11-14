'use client';
import {createContext, forwardRef, useContext, useRef, type AnchorHTMLAttributes, type HTMLAttributes, type PointerEvent, type ReactNode, type RefObject} from 'react';
import {Slot} from '../../utils/slot';
import {useControllableState} from '../../hooks/use-controllable-state';
import {cx} from '../../utils/cx';
import {setRefs} from '../../utils/overlay';
import {Floating, useDismiss, useHydrated, useHoverIntent, type Placement} from '../popover/float';

interface Ctx { open: boolean; show: (open: boolean, delay?: number) => void; openDelay: number; closeDelay: number; trigger: RefObject<HTMLElement | null> }
const Context = createContext<Ctx>(null as never);

export interface HoverCardProps {
  /** Controlled open state. */
  open?: boolean;
  /** Initial open state when uncontrolled. Default false. */
  defaultOpen?: boolean;
  /** Called with the next open state. */
  onOpenChange?: (open: boolean) => void;
  /** Milliseconds the pointer must rest on the trigger before the card opens. Default 700. */
  openDelay?: number;
  /** Milliseconds before the card closes after the pointer leaves the trigger and the card. Default 300. */
  closeDelay?: number;
  /** The parts of the component: a trigger and its content. */
  children?: ReactNode;
}

/** The root of a card that shows extra detail when its trigger is hovered or focused. Put a `HoverCardTrigger` and `HoverCardContent` inside. */
export function HoverCard({open, defaultOpen = false, onOpenChange, openDelay = 700, closeDelay = 300, children}: HoverCardProps) {
  const [isOpen, setOpen] = useControllableState({value: open, defaultValue: defaultOpen, onChange: onOpenChange});
  const show = useHoverIntent(setOpen);
  const trigger = useRef<HTMLElement | null>(null);
  return <Context.Provider value={{open: isOpen, show, openDelay, closeDelay, trigger}}>{children}</Context.Provider>;
}

/** The element (usually a link) that shows the card on hover or focus; use `asChild` to render your own element. */
export const HoverCardTrigger = forwardRef<HTMLAnchorElement, AnchorHTMLAttributes<HTMLAnchorElement> & {
  /** Render your own element instead of an anchor; it receives the props and handlers. */
  asChild?: boolean;
}>(function HoverCardTrigger({asChild, ...rest}, ref) {
  const c = useContext(Context);
  const Comp = asChild ? Slot : 'a';
  return <Comp ref={(n: HTMLAnchorElement | null) => setRefs(n, c.trigger, ref)} data-state={c.open ? 'open' : 'closed'} {...rest} onPointerEnter={(e: PointerEvent) => { if (e.pointerType !== 'touch') c.show(true, c.openDelay); }} onPointerLeave={() => c.show(false, c.closeDelay)} onFocus={() => c.show(true)} onBlur={() => c.show(false)} />;
});

const Panel = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement> & Placement>(function Panel({className, sideOffset = 8, align = 'start', ...rest}, forwarded) {
  const c = useContext(Context);
  const el = useRef<HTMLDivElement | null>(null);
  useDismiss(true, [el, c.trigger], () => c.show(false));
  return <Floating ref={(n) => setRefs(n, el, forwarded)} anchor={() => c.trigger.current} sideOffset={sideOffset} align={align} data-state="open" onPointerEnter={() => c.show(true)} onPointerLeave={() => c.show(false, c.closeDelay)} className={cx('popover', className)} {...rest} />;
});

/** The floating card, opening 8px from the trigger and aligned to its start. Keep it supplementary: it is not reachable by touch. */
export const HoverCardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement> & Placement>(function HoverCardContent(props, ref) {
  const {open} = useContext(Context), hydrated = useHydrated();
  return open && hydrated ? <Panel ref={ref} {...props} /> : null;
});
