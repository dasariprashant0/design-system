'use client';
import {createContext, forwardRef, useContext, useEffect, useId, useRef, type HTMLAttributes, type ReactNode} from 'react';
import {Slot} from 'radix-ui';
import {useControllableState} from '../../hooks/use-controllable-state';
import {cx} from '../../utils/cx';
import {setRefs} from '../../utils/overlay';
import {Floating, useDismiss, useHoverIntent, type Placement} from '../popover/float';

const Shared = createContext({delayDuration: 700, skipDelayDuration: 300});
let lastClosed = 0; // when any tooltip last closed: moving between tooltips shows the next one at once

/** Wrap your app (or a region) once. Sets the shared open delay (`delayDuration`, default 700 ms) and how long after one tooltip closes the next opens at once (`skipDelayDuration`, default 300 ms). */
export function TooltipProvider({delayDuration = 700, skipDelayDuration = 300, children}: {
  /** Milliseconds to wait before a tooltip shows on hover. */
  delayDuration?: number;
  /** Milliseconds after a tooltip closes during which the next one opens without delay. */
  skipDelayDuration?: number;
  children?: ReactNode;
}) {
  return <Shared.Provider value={{delayDuration, skipDelayDuration}}>{children}</Shared.Provider>;
}

interface Ctx { open: boolean; show: (open: boolean, delay?: number) => void; id: string; trigger: React.RefObject<HTMLElement | null> }
const Context = createContext<Ctx>(null as never);

export interface TooltipProps {
  /** The text shown. Keep it short; it repeats or extends a label and must never hold essential information alone. */
  content: ReactNode;
  /** The trigger element. It receives aria-describedby when open. */
  children: ReactNode;
  /** Which side of the trigger the tooltip appears on: `top` (default), `right`, `bottom` or `left`. */
  side?: 'top' | 'right' | 'bottom' | 'left';
  /** Milliseconds to wait before showing on hover. Defaults to the `TooltipProvider` value. */
  delayDuration?: number;
  /** Whether the tooltip is open when controlled. Pair with `onOpenChange`. */
  open?: boolean;
  /** Whether the tooltip starts open when uncontrolled. Default false. */
  defaultOpen?: boolean;
  /** Called with the new open state when the tooltip shows or hides. */
  onOpenChange?: (open: boolean) => void;
}

/**
 * Hint text on hover and keyboard focus. Escape dismisses it.
 * @example <Tooltip content="Saved to ~/Notes"><Button>Save</Button></Tooltip>
 */
export function Tooltip({content, children, side = 'top', delayDuration, open, defaultOpen = false, onOpenChange}: TooltipProps) {
  const shared = useContext(Shared);
  const [isOpen, setOpen] = useControllableState({value: open, defaultValue: defaultOpen, onChange: (o) => { if (!o) lastClosed = Date.now(); onOpenChange?.(o); }});
  const show = useHoverIntent(setOpen);
  const trigger = useRef<HTMLElement | null>(null), pressed = useRef(false), moved = useRef(false), id = useId();
  const delay = Date.now() - lastClosed < shared.skipDelayDuration ? 0 : delayDuration ?? shared.delayDuration;
  return (
    <Context.Provider value={{open: isOpen, show, id, trigger}}>
      <Slot.Root
        ref={trigger}
        aria-describedby={isOpen ? id : undefined}
        data-state={isOpen ? 'open' : 'closed'}
        onPointerMove={(e: React.PointerEvent) => { if (e.pointerType !== 'touch' && !moved.current) { moved.current = true; show(true, delay); } }} /* a real move, not a layout shift under a resting pointer */
        onPointerLeave={() => { moved.current = false; show(false, 100); }}
        onPointerDown={() => { pressed.current = true; document.addEventListener('pointerup', () => { pressed.current = false; }, {once: true}); show(false); }}
        onFocus={() => { if (!pressed.current) show(true); }}
        onBlur={() => show(false)}
      >{children}</Slot.Root>
      {isOpen && <TooltipContent side={side}>{content}</TooltipContent>}
    </Context.Provider>
  );
}

/** The floating tooltip box. `Tooltip` renders one for you; it works only inside a `Tooltip`. */
export const TooltipContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement> & Placement>(function TooltipContent({className, sideOffset = 6, side = 'top', ...rest}, forwarded) {
  const c = useContext(Context);
  const el = useRef<HTMLDivElement | null>(null);
  useDismiss(c.open, [el, c.trigger], () => c.show(false));
  // scrolling the page (or any scroller around the trigger) moves the trigger away from the pointer: close, like a hint should
  useEffect(() => {
    const close = (e: Event) => { if ((e.target as Node).contains?.(c.trigger.current)) c.show(false); };
    addEventListener('scroll', close, true);
    return () => removeEventListener('scroll', close, true);
  }, []);
  return <Floating ref={(n) => setRefs(n, el, forwarded)} anchor={() => c.trigger.current} side={side} sideOffset={sideOffset} role="tooltip" id={c.id} data-state="open" onPointerEnter={() => c.show(true)} onPointerLeave={() => c.show(false, 100)} className={cx('tooltip', className)} {...rest} />;
});
