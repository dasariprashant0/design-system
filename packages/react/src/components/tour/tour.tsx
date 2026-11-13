'use client';
import {useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type HTMLAttributes, type KeyboardEvent, type ReactNode} from 'react';
import {createPortal} from 'react-dom';
import {cx} from '../../utils/cx';
import {useIsRtl} from '../../utils/direction';

/** One stop in a tour. */
export interface TourStep {
  /** The element to highlight: a CSS selector, an element, or a function returning one. Leave out to show a centred card with no highlight. */
  target?: string | HTMLElement | (() => HTMLElement | null);
  /** Heading of the step card. Also names the dialog. */
  title: ReactNode;
  /** Body text of the step card. */
  content?: ReactNode;
  /** Preferred side of the target for the card: `top`, `bottom`, `start` or `end`. The card flips if there is no room. Default `bottom`. */
  placement?: 'top' | 'bottom' | 'start' | 'end';
}

/** Button and announcement text, for translation. */
export interface TourLabels {
  /** Text of the next button. Default "Next". */
  next?: string;
  /** Text of the back button. Default "Back". */
  back?: string;
  /** Text of the skip button. Default "Skip tour". */
  skip?: string;
  /** Text of the next button on the last step. Default "Done". */
  done?: string;
}

export interface TourProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'children'> {
  /** The steps, in order. */
  steps: TourStep[];
  /** Whether the tour is showing, when controlled. Pair with `onOpenChange`. */
  open?: boolean;
  /** Whether the tour starts open when uncontrolled. Default false. */
  defaultOpen?: boolean;
  /** Called with false when the tour ends: Skip, Escape or Done. */
  onOpenChange?: (open: boolean) => void;
  /** The current step index when controlled. Pair with `onStepChange`. */
  step?: number;
  /** The step to start on when uncontrolled. Default 0. */
  defaultStep?: number;
  /** Called with the new index when the user moves between steps. */
  onStepChange?: (step: number) => void;
  /** Called when the user finishes the last step (not when they skip or press Escape). */
  onFinish?: () => void;
  /** Extra space in px around the highlighted element. Default 6. */
  spotlightPadding?: number;
  /** Replaces the button text. */
  labels?: TourLabels;
}

type Box = {top: number; left: number; width: number; height: number};
const resolve = (t: TourStep['target']): HTMLElement | null => (typeof t === 'string' ? document.querySelector<HTMLElement>(t) : typeof t === 'function' ? t() : t ?? null);
const GAP = 12;
const EDGE = 8;

/** A guided tour: a spotlight over a target element with a card holding the step text and Back, Next and Skip buttons. The card is a dialog that takes focus, Escape ends the tour and focus returns to where it was. Arrow keys move between steps, the target scrolls into view, and each step is announced politely. */
export function Tour({steps, open, defaultOpen = false, onOpenChange, step, defaultStep = 0, onStepChange, onFinish, spotlightPadding = 6, labels, className, ...rest}: TourProps) {
  const [innerOpen, setInnerOpen] = useState(defaultOpen);
  const [innerStep, setInnerStep] = useState(defaultStep);
  const isOpen = open ?? innerOpen;
  const index = Math.min(Math.max(step ?? innerStep, 0), Math.max(steps.length - 1, 0));
  const s = steps[index];
  const [box, setBox] = useState<Box | null>(null);
  const [pos, setPos] = useState<{top: number; left: number} | null>(null);
  const card = useRef<HTMLDivElement>(null);
  const anchor = useRef<HTMLSpanElement>(null);
  const [dir, setDir] = useState<'rtl' | 'ltr' | undefined>();
  const returnTo = useRef<HTMLElement | null>(null);
  const isRtl = useIsRtl();
  const id = useId();
  const L = {next: 'Next', back: 'Back', skip: 'Skip tour', done: 'Done', ...labels};
  const last = index === steps.length - 1;

  const close = useCallback(() => { if (open === undefined) setInnerOpen(false); onOpenChange?.(false); }, [open, onOpenChange]);
  const go = (n: number) => { if (n < 0 || n >= steps.length) return; if (step === undefined) setInnerStep(n); onStepChange?.(n); };

  // The card is portalled to <body>, so carry the surrounding text direction across.
  useLayoutEffect(() => { if (isOpen && anchor.current) setDir(isRtl(anchor.current) ? 'rtl' : 'ltr'); }); // eslint-disable-line

  // Remember where focus was; give it back when the tour closes.
  useEffect(() => {
    if (!isOpen) return;
    returnTo.current = document.activeElement as HTMLElement | null;
    return () => { returnTo.current?.focus?.(); };
  }, [isOpen]);

  // Find the target, scroll it into view and measure it.
  const measure = useCallback(() => {
    const el = s && resolve(s.target);
    if (!el) { setBox(null); return el; }
    const r = el.getBoundingClientRect();
    setBox({top: r.top, left: r.left, width: r.width, height: r.height});
    return el;
  }, [s]);
  useLayoutEffect(() => {
    if (!isOpen || !s) return;
    const el = measure();
    if (el) {
      const calm = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      el.scrollIntoView?.({block: 'center', inline: 'nearest', behavior: calm ? 'auto' : 'smooth'});
      measure();
    }
    const again = () => measure();
    window.addEventListener('resize', again);
    window.addEventListener('scroll', again, true);
    return () => { window.removeEventListener('resize', again); window.removeEventListener('scroll', again, true); };
  }, [isOpen, s, measure]);

  // Place the card beside the spotlight, flipping when there is no room, and keep it on screen.
  useLayoutEffect(() => {
    if (!isOpen || !card.current) return;
    const w = card.current.offsetWidth, h = card.current.offsetHeight;
    const vw = window.innerWidth, vh = window.innerHeight;
    if (!box) { setPos({top: Math.max(EDGE, (vh - h) / 2), left: Math.max(EDGE, (vw - w) / 2)}); return; }
    const rtl = isRtl(card.current);
    const pad = spotlightPadding;
    const want = s?.placement ?? 'bottom';
    const side = want === 'start' ? (rtl ? 'right' : 'left') : want === 'end' ? (rtl ? 'left' : 'right') : want;
    const room = {top: box.top - pad, bottom: vh - (box.top + box.height + pad), left: box.left - pad, right: vw - (box.left + box.width + pad)};
    const need = side === 'top' || side === 'bottom' ? h + GAP : w + GAP;
    const flip = {top: 'bottom', bottom: 'top', left: 'right', right: 'left'} as const;
    const use = room[side] >= need || room[flip[side]] < need ? side : flip[side];
    let top: number, left: number;
    if (use === 'top' || use === 'bottom') {
      top = use === 'top' ? box.top - pad - GAP - h : box.top + box.height + pad + GAP;
      left = box.left + box.width / 2 - w / 2;
    } else {
      left = use === 'left' ? box.left - pad - GAP - w : box.left + box.width + pad + GAP;
      top = box.top + box.height / 2 - h / 2;
    }
    setPos({top: Math.min(Math.max(EDGE, top), Math.max(EDGE, vh - h - EDGE)), left: Math.min(Math.max(EDGE, left), Math.max(EDGE, vw - w - EDGE))});
  }, [isOpen, box, s, spotlightPadding]); // isRtl is a fresh function each render, so it is left out on purpose

  // Each step moves focus to the card so a screen reader reads its title and text.
  useEffect(() => { if (isOpen) card.current?.focus({preventScroll: true}); }, [isOpen, index]);

  if (!isOpen || !s || typeof document === 'undefined') return <span ref={anchor} hidden />;

  const keydown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); return; }
    if (e.key === 'Tab') { // keep focus inside the card
      const items = [...e.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled)')];
      const first = items[0], end = items[items.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === e.currentTarget)) { e.preventDefault(); end?.focus(); }
      else if (!e.shiftKey && document.activeElement === end) { e.preventDefault(); first?.focus(); }
      return;
    }
    if (e.target !== e.currentTarget) return; // arrows only act when the card itself has focus
    const fwd = isRtl(e.currentTarget) ? 'ArrowLeft' : 'ArrowRight';
    if (e.key === fwd) { e.preventDefault(); if (last) return; go(index + 1); }
    else if (e.key === (fwd === 'ArrowRight' ? 'ArrowLeft' : 'ArrowRight')) { e.preventDefault(); go(index - 1); }
  };
  const next = () => { if (last) { close(); onFinish?.(); } else go(index + 1); };
  const pad = spotlightPadding;

  return <>
    <span ref={anchor} hidden />
    {createPortal(
    <div className={cx('tour', className)} dir={dir} {...rest}>
      <div className="tour-overlay" aria-hidden="true" onMouseDown={(e) => e.preventDefault()} />
      {box && <div className="tour-spotlight" aria-hidden="true" style={{top: box.top - pad, left: box.left - pad, width: box.width + pad * 2, height: box.height + pad * 2}} />}
      <div
        ref={card}
        role="dialog"
        aria-labelledby={`${id}-t`}
        aria-describedby={s.content ? `${id}-c` : undefined}
        tabIndex={-1}
        className="tour-card"
        style={pos ? {top: pos.top, left: pos.left} : {visibility: 'hidden'}}
        onKeyDown={keydown}
      >
        <p className="tour-count">{index + 1} of {steps.length}</p>
        <h2 id={`${id}-t`} className="tour-title">{s.title}</h2>
        {s.content && <div id={`${id}-c`} className="tour-content">{s.content}</div>}
        <div className="tour-actions">
          <button type="button" className="btn btn-ghost btn-sm" onClick={close}>{L.skip}</button>
          <span className="tour-spacer" />
          {index > 0 && <button type="button" className="btn btn-sm" onClick={() => go(index - 1)}>{L.back}</button>}
          <button type="button" className="btn btn-solid btn-sm" onClick={next}>{last ? L.done : L.next}</button>
        </div>
      </div>
      <div className="sr-only" role="status">{`Step ${index + 1} of ${steps.length}: ${typeof s.title === 'string' ? s.title : ''}`}</div>
    </div>,
    document.body,
  )}</>;
}
