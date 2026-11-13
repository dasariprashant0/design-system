'use client';
import {forwardRef, useEffect, useId, useRef, useState, type HTMLAttributes, type ReactNode} from 'react';
import {cx} from '../../utils/cx';
import {useIsRtl} from '../../utils/direction';
import {useControllableState} from '../../hooks/use-controllable-state';

export interface SortableItem {
  /** Unique key for the item. */
  id: string;
  /** What the row shows. */
  label: ReactNode;
  /** Plain text used in the handle's name and the live announcements. Defaults to `label` when it is a string, otherwise the `id`. */
  text?: string;
}

export interface SortableListProps extends Omit<HTMLAttributes<HTMLUListElement>, 'defaultValue' | 'onChange'> {
  /** Required: names the list. */
  'aria-label': string;
  /** The items in their current order when controlled. Pair with `onValueChange`. */
  value?: SortableItem[];
  /** The items in their starting order when uncontrolled. */
  defaultValue?: SortableItem[];
  /** Called with the new order when the user drops an item in a new place. Not called for a cancelled move or a drop where it started. */
  onValueChange?: (items: SortableItem[]) => void;
  /** `vertical` (default) moves with ArrowUp and ArrowDown; `horizontal` lays the items in a row and moves with ArrowLeft and ArrowRight. */
  orientation?: 'vertical' | 'horizontal';
}

const nameOf = (i: SortableItem) => i.text ?? (typeof i.label === 'string' ? i.label : i.id);
const move = (ids: string[], id: string, to: number) => {
  const next = ids.filter((x) => x !== id);
  next.splice(Math.max(0, Math.min(ids.length - 1, to)), 0, id);
  return next;
};

/**
 * A list the user can reorder by dragging a handle or with the keyboard: Space picks an item up, the arrow keys move it, Space drops it and Escape cancels.
 * Every step is announced in a polite live region ("Moved to position 3 of 5"). Controlled with `value` + `onValueChange`, or uncontrolled with `defaultValue`.
 * @example <SortableList aria-label="Priorities" defaultValue={items} onValueChange={save} />
 */
export const SortableList = forwardRef<HTMLUListElement, SortableListProps>(function SortableList({value, defaultValue = [], onValueChange, orientation = 'vertical', className, ...rest}, ref) {
  const [order, setOrder] = useControllableState<SortableItem[]>({value, defaultValue, onChange: onValueChange});
  const [draft, setDraftState] = useState<string[] | null>(null);
  const [active, setActive] = useState<{id: string; pointer: boolean} | null>(null);
  const [message, setMessage] = useState('');
  const draftRef = useRef<string[] | null>(null);
  const rows = useRef(new Map<string, HTMLLIElement>());
  const handles = useRef(new Map<string, HTMLButtonElement>());
  const hintId = useId();
  const isRtl = useIsRtl();
  const horizontal = orientation === 'horizontal';

  const setDraft = (ids: string[] | null) => { draftRef.current = ids; setDraftState(ids); };
  const byId = new Map(order.map((i) => [i.id, i]));
  const shown = draft ? draft.map((id) => byId.get(id)!).filter(Boolean) : order;
  const total = order.length;
  const label = (id: string) => nameOf(byId.get(id)!);

  const pickUp = (id: string, pointer: boolean) => {
    setDraft(order.map((i) => i.id));
    setActive({id, pointer});
    setMessage(`Picked up ${label(id)}, position ${order.findIndex((i) => i.id === id) + 1} of ${total}. ${pointer ? 'Drag to move.' : 'Use the arrow keys to move, Space to drop, Escape to cancel.'}`);
  };
  const to = (id: string, index: number) => {
    const cur = draftRef.current!;
    if (cur.indexOf(id) === index) return;
    const next = move(cur, id, index);
    setDraft(next);
    setMessage(`${label(id)} moved to position ${next.indexOf(id) + 1} of ${total}.`);
  };
  const drop = () => {
    const ids = draftRef.current;
    if (!ids || !active) return;
    const changed = ids.some((id, i) => id !== order[i]!.id);
    setMessage(`${label(active.id)} dropped at position ${ids.indexOf(active.id) + 1} of ${total}.`);
    if (changed) setOrder(ids.map((id) => byId.get(id)!));
    setDraft(null); setActive(null);
  };
  const cancel = (quiet?: boolean) => {
    if (!active) return;
    if (!quiet) setMessage(`Move cancelled. ${label(active.id)} is back at position ${order.findIndex((i) => i.id === active.id) + 1} of ${total}.`);
    setDraft(null); setActive(null);
  };

  // Moving a node in the DOM can drop focus in some browsers; give it back to the handle in use.
  useEffect(() => { if (active && !active.pointer) { const h = handles.current.get(active.id); if (h && document.activeElement !== h) h.focus(); } }, [draft, active]);

  // Pointer drag listens on the document, because the dragged row is re-parented as it moves.
  useEffect(() => {
    if (!active?.pointer) return;
    const id = active.id;
    const onMove = (e: PointerEvent) => {
      const p = horizontal ? e.clientX : e.clientY;
      const others = (draftRef.current ?? []).filter((x) => x !== id);
      const rtl = horizontal && isRtl(rows.current.get(id));
      let index = 0;
      for (const o of others) {
        const r = rows.current.get(o)?.getBoundingClientRect();
        if (!r) continue;
        const mid = horizontal ? (r.left + r.right) / 2 : (r.top + r.bottom) / 2;
        if (rtl ? p < mid : p > mid) index++;
      }
      to(id, index);
    };
    const end = () => drop();
    const abort = () => cancel();
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', end);
    document.addEventListener('pointercancel', abort);
    return () => { document.removeEventListener('pointermove', onMove); document.removeEventListener('pointerup', end); document.removeEventListener('pointercancel', abort); };
  });

  const keydown = (e: React.KeyboardEvent<HTMLButtonElement>, id: string) => {
    if (e.key === 'Tab') { cancel(true); return; }
    const grabbed = active?.id === id;
    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); if (grabbed) drop(); else if (!active) pickUp(id, false); return; }
    if (!grabbed) return;
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); cancel(); return; }
    const flip = horizontal && isRtl(e.currentTarget) ? -1 : 1;
    const step = horizontal ? ({ArrowRight: flip, ArrowLeft: -flip} as Record<string, number>)[e.key] : ({ArrowDown: 1, ArrowUp: -1} as Record<string, number>)[e.key];
    const edge = e.key === 'Home' ? 0 : e.key === 'End' ? total - 1 : undefined;
    if (step === undefined && edge === undefined) return;
    e.preventDefault();
    to(id, edge ?? draftRef.current!.indexOf(id) + step!);
  };

  return (
    <>
      <ul ref={ref} className={cx('sortable-list', horizontal && 'sortable-list-horizontal', className)} {...rest}>
        {shown.map((item) => {
          const grabbed = active?.id === item.id;
          return (
            <li key={item.id} ref={(el) => { if (el) rows.current.set(item.id, el); else rows.current.delete(item.id); }} className="sortable-list-item" data-dragging={grabbed || undefined}>
              <button
                type="button"
                ref={(el) => { if (el) handles.current.set(item.id, el); else handles.current.delete(item.id); }}
                className="sortable-list-handle"
                aria-label={`Reorder ${nameOf(item)}`}
                aria-describedby={hintId}
                aria-pressed={grabbed}
                onKeyDown={(e) => keydown(e, item.id)}
                onPointerDown={(e) => { if (e.button === 0 && !active) { e.preventDefault(); e.currentTarget.focus(); pickUp(item.id, true); } }}
              ><svg aria-hidden="true" viewBox="0 0 16 16" width="1em" height="1em" fill="currentColor"><path d="M5 3h2v2H5zM9 3h2v2H9zM5 7h2v2H5zM9 7h2v2H9zM5 11h2v2H5zM9 11h2v2H9z" /></svg></button>
              <span className="sortable-list-label">{item.label}</span>
            </li>
          );
        })}
      </ul>
      <span id={hintId} className="sr-only">Press Space to pick up, the arrow keys to move, Space again to drop, Escape to cancel.</span>
      <span role="status" aria-live="polite" className="sr-only">{message}</span>
    </>
  );
});
