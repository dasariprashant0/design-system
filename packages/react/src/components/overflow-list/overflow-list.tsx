'use client';
import {forwardRef, useEffect, useLayoutEffect, useRef, useState, type HTMLAttributes, type ReactNode} from 'react';
import {Button} from '../button';
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from '../dropdown-menu';
import {cx} from '../../utils/cx';

const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

export interface OverflowItem {
  /** Unique key for the item. */
  id: string;
  /** What is shown, inline when it fits and as a menu item when it does not. */
  label: ReactNode;
  /** Called when the item is chosen from the "+N" menu. Inline items handle their own clicks inside `label`. */
  onSelect?: () => void;
  /** Greys the item out in the menu. */
  disabled?: boolean;
}

export interface OverflowListProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** The items in order. As many as fit are shown; the rest move into a "+N" menu. */
  items: OverflowItem[];
  /** Accessible name of the "+N" button, given the number of hidden items. Default "N more items". */
  moreLabel?: (hidden: number) => string;
}

/** How many of `widths` fit in `avail`, leaving room for a `more` button when some must be dropped. */
function fit(avail: number, widths: number[], gap: number, more: number) {
  const total = widths.reduce((a, w, i) => a + w + (i ? gap : 0), 0);
  if (total <= avail) return widths.length;
  let used = more + gap, n = 0;
  for (const w of widths) {
    const next = used + w + (n ? gap : 0);
    if (next > avail) break;
    used = next; n++;
  }
  return n;
}

/**
 * A single row of items that shows as many as fit and moves the rest into a "+N" menu, recalculating when the width changes (ResizeObserver).
 * Hidden items stay measurable but are not focusable or read out; the menu is a Radix dropdown, so it is fully keyboard operable.
 * @example <OverflowList items={tags.map((t) => ({id: t, label: <Tag>{t}</Tag>}))} />
 */
export const OverflowList = forwardRef<HTMLDivElement, OverflowListProps>(function OverflowList({items, moreLabel = (n) => `${n} more ${n === 1 ? 'item' : 'items'}`, className, ...rest}, ref) {
  const [shown, setShown] = useState(items.length);
  const root = useRef<HTMLDivElement | null>(null);
  const list = useRef<HTMLUListElement>(null);
  const more = useRef<HTMLSpanElement>(null);
  const moreWidth = useRef(40);

  const measure = () => {
    const ul = list.current, el = root.current;
    if (!ul || !el) return;
    if (more.current) moreWidth.current = more.current.offsetWidth || moreWidth.current;
    const widths = Array.from(ul.children, (c) => (c as HTMLElement).offsetWidth);
    const gap = parseFloat(getComputedStyle(ul).columnGap) || 0;
    setShown(fit(el.clientWidth, widths, gap, moreWidth.current));
  };
  useIsoLayoutEffect(measure, [items]);
  useEffect(() => {
    if (!root.current || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(measure);
    ro.observe(root.current);
    return () => ro.disconnect();
  }, []);

  const hidden = items.slice(shown);
  return (
    <div ref={(el) => { root.current = el; if (typeof ref === 'function') ref(el); else if (ref) ref.current = el; }} className={cx('overflow-list', className)} {...rest}>
      <ul ref={list} className="overflow-list-items">
        {items.map((it, i) => <li key={it.id} className="overflow-list-item" data-hidden={i >= shown || undefined}>{it.label}</li>)}
      </ul>
      {hidden.length > 0 && (
        <span ref={more} className="overflow-list-more">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" aria-label={moreLabel(hidden.length)}>+{hidden.length}</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {hidden.map((it) => <DropdownMenuItem key={it.id} disabled={it.disabled} onSelect={it.onSelect}>{it.label}</DropdownMenuItem>)}
            </DropdownMenuContent>
          </DropdownMenu>
        </span>
      )}
    </div>
  );
});
