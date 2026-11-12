'use client';
import {Children, createContext, forwardRef, isValidElement, useContext, useId, useRef, useState, type HTMLAttributes, type KeyboardEvent, type PointerEvent, type ReactNode} from 'react';
import {cx} from '../../utils/cx';
import {useIsRtl} from '../../utils/direction';

interface GroupCtx {
  direction: 'horizontal' | 'vertical';
  sizes: number[];
  limits: {min: number; max: number}[];
  base: string;
  step: number;
  resize: (handle: number, from: number[], delta: number) => void;
  root: React.RefObject<HTMLDivElement | null>;
}
const Group = createContext<GroupCtx | null>(null);
const Index = createContext(0);

export interface ResizablePanelGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** `horizontal` puts panels side by side; `vertical` stacks them. Default `horizontal`. */
  direction?: 'horizontal' | 'vertical';
  /** Percent a panel grows or shrinks per arrow-key press (PageUp/PageDown use double). Default 5. */
  step?: number;
  /** Called with every panel's size in percent (they add up to 100) after each resize. */
  onLayoutChange?: (sizes: number[]) => void;
  /** `ResizablePanel` and `ResizableHandle` elements, alternating, as direct children: panel, handle, panel... */
  children: ReactNode;
}
export interface ResizablePanelProps extends HTMLAttributes<HTMLDivElement> {
  /** Starting size in percent. Panels without one share what is left equally. */
  defaultSize?: number;
  /** Smallest size in percent. Default 10. */
  minSize?: number;
  /** Largest size in percent. Default 100. */
  maxSize?: number;
}
export interface ResizableHandleProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Names the handle for screen readers. Default "Resize panels". */
  'aria-label'?: string;
}

const clamp = (n: number, lo: number, hi: number) => Math.min(Math.max(n, lo), hi);

/** A row or column of panels separated by draggable, keyboard-operable handles. Put `ResizablePanel` and `ResizableHandle` as direct children, alternating. Sizes are percentages of the group. */
export const ResizablePanelGroup = forwardRef<HTMLDivElement, ResizablePanelGroupProps>(function ResizablePanelGroup({direction = 'horizontal', step = 5, onLayoutChange, className, children, ...rest}, ref) {
  const base = useId();
  const root = useRef<HTMLDivElement>(null);
  const items = Children.toArray(children);
  const panels = items.filter((c) => isValidElement<ResizablePanelProps>(c) && c.type === ResizablePanel) as React.ReactElement<ResizablePanelProps>[];
  const limits = panels.map((p) => ({min: p.props.minSize ?? 10, max: p.props.maxSize ?? 100}));
  const [sizes, setSizes] = useState<number[]>(() => {
    const given = panels.reduce((a, p) => a + (p.props.defaultSize ?? 0), 0);
    const open = panels.filter((p) => p.props.defaultSize === undefined).length;
    return panels.map((p) => p.props.defaultSize ?? (open ? Math.max(0, 100 - given) / open : 100 / panels.length));
  });
  const live = sizes.length === panels.length ? sizes : panels.map(() => 100 / panels.length);

  const resize = (h: number, from: number[], delta: number) => {
    const a = from[h], b = from[h + 1], la = limits[h], lb = limits[h + 1];
    if (a === undefined || b === undefined || !la || !lb) return;
    const total = a + b;
    const na = clamp(a + delta, Math.max(la.min, total - lb.max), Math.min(la.max, total - lb.min));
    const next = from.slice();
    next[h] = na; next[h + 1] = total - na;
    if (next[h] === live[h]) return;
    setSizes(next);
    onLayoutChange?.(next);
  };

  let p = -1;
  return (
    <Group.Provider value={{direction, sizes: live, limits, base, step, resize, root}}>
      <div ref={(el) => { root.current = el; if (typeof ref === 'function') ref(el); else if (ref) ref.current = el; }} className={cx('resizable', className)} data-direction={direction} {...rest}>
        {items.map((c, i) => {
          if (isValidElement(c) && c.type === ResizablePanel) p++;
          return <Index.Provider key={isValidElement(c) && c.key !== null ? c.key : i} value={Math.max(p, 0)}>{c}</Index.Provider>;
        })}
      </div>
    </Group.Provider>
  );
});

/** One resizable region. Its size is a percentage of the group; it scrolls when its content is larger. */
export const ResizablePanel = forwardRef<HTMLDivElement, ResizablePanelProps>(function ResizablePanel({defaultSize: _d, minSize: _n, maxSize: _x, className, style, id, ...rest}, ref) {
  const g = useContext(Group);
  const i = useContext(Index);
  const size = g?.sizes[i] ?? 100;
  return <div ref={ref} id={id ?? (g ? `${g.base}-${i}` : undefined)} className={cx('resizable-panel', className)} style={{flex: `${size} ${size} 0%`, ...style}} data-size={Math.round(size)} {...rest} />;
});

/** The draggable divider between two panels. It is a separator you can focus: arrow keys resize, Home and End go to the limits. Drag with a pointer too. */
export const ResizableHandle = forwardRef<HTMLDivElement, ResizableHandleProps>(function ResizableHandle({className, onKeyDown, onPointerDown, 'aria-label': label = 'Resize panels', ...rest}, ref) {
  const g = useContext(Group);
  const i = useContext(Index); // index of the panel before this handle
  const isRtl = useIsRtl();
  const [drag, setDrag] = useState(false);
  const start = useRef<{pos: number; from: number[]; span: number} | null>(null);
  if (!g) return null;
  const horizontal = g.direction === 'horizontal';
  const here = g.sizes[i] ?? 0, after = g.sizes[i + 1] ?? 0;
  const la = g.limits[i], lb = g.limits[i + 1];
  const lo = la && lb ? Math.max(la.min, here + after - lb.max) : 0;
  const hi = la && lb ? Math.min(la.max, here + after - lb.min) : 100;

  const keydown = (e: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented) return;
    const rtl = horizontal && isRtl(e.currentTarget);
    const grow = horizontal ? (rtl ? 'ArrowLeft' : 'ArrowRight') : 'ArrowDown';
    const shrink = horizontal ? (rtl ? 'ArrowRight' : 'ArrowLeft') : 'ArrowUp';
    const k = e.key;
    let d: number | null = null;
    if (k === grow) d = g.step; else if (k === shrink) d = -g.step;
    else if (k === 'PageDown' || k === 'PageUp') d = (k === 'PageDown' ? 1 : -1) * g.step * 2;
    else if (k === 'Home') d = lo - here; else if (k === 'End') d = hi - here;
    if (d === null) return;
    e.preventDefault();
    g.resize(i, g.sizes, d);
  };
  const down = (e: PointerEvent<HTMLDivElement>) => {
    onPointerDown?.(e);
    if (e.defaultPrevented || e.button !== 0) return;
    const r = g.root.current?.getBoundingClientRect();
    start.current = {pos: horizontal ? e.clientX : e.clientY, from: g.sizes, span: (horizontal ? r?.width : r?.height) || 1};
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setDrag(true);
  };
  const move = (e: PointerEvent<HTMLDivElement>) => {
    const s = start.current;
    if (!s) return;
    const px = (horizontal ? e.clientX : e.clientY) - s.pos;
    g.resize(i, s.from, ((horizontal && isRtl(e.currentTarget) ? -px : px) / s.span) * 100);
  };
  const up = (e: PointerEvent<HTMLDivElement>) => { start.current = null; setDrag(false); e.currentTarget.releasePointerCapture?.(e.pointerId); };

  return (
    <div
      ref={ref}
      role="separator"
      tabIndex={0}
      aria-orientation={horizontal ? 'vertical' : 'horizontal'}
      aria-valuenow={Math.round(here)}
      aria-valuemin={Math.round(lo)}
      aria-valuemax={Math.round(hi)}
      aria-controls={`${g.base}-${i}`}
      aria-label={label}
      className={cx('resizable-handle', className)}
      data-dragging={drag || undefined}
      onKeyDown={keydown}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
      {...rest}
    />
  );
});
