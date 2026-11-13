'use client';
import {forwardRef, useEffect, useRef, useState, type HTMLAttributes, type ReactNode} from 'react';
import {cx} from '../../utils/cx';

export interface VirtualListProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Required: names the list for screen readers. */
  'aria-label': string;
  /** How many rows the whole list has, rendered or not. */
  count: number;
  /** Height of every row in pixels. All rows share it. */
  itemHeight: number;
  /** Height of the scrolling window in pixels. */
  height: number;
  /** Extra rows rendered above and below the visible ones, so fast scrolling shows no blanks. Default 4. */
  overscan?: number;
  /** Returns the content of row `index`. Only called for rows in or near the window. */
  renderItem: (index: number) => ReactNode;
}

/**
 * A windowed list for large arrays: only the visible rows (plus `overscan`) exist in the page.
 * Every row has `aria-posinset` and `aria-setsize`, so assistive tech still reports "7 of 10,000".
 * One row is in the tab order; ArrowUp/Down, PageUp/Down, Home and End move between rows.
 * @example <VirtualList aria-label="Users" count={10000} itemHeight={32} height={320} renderItem={(i) => users[i].name} />
 */
export const VirtualList = forwardRef<HTMLDivElement, VirtualListProps>(function VirtualList({count, itemHeight, height, overscan = 4, renderItem, className, style, onScroll, onKeyDown, ...rest}, ref) {
  const [top, setTop] = useState(0);
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement | null>(null);
  const pending = useRef(false);
  const cur = Math.min(active, Math.max(0, count - 1));

  const first = Math.max(0, Math.floor(top / itemHeight) - overscan);
  const last = Math.min(count - 1, Math.ceil((top + height) / itemHeight) + overscan);
  const rows: number[] = [];
  for (let i = first; i <= last; i++) rows.push(i);
  const stop = cur >= first && cur <= last ? cur : first; // scrolled away: the first rendered row takes the tab stop

  useEffect(() => {
    if (!pending.current) return;
    pending.current = false;
    root.current?.querySelector<HTMLElement>(`[data-index="${cur}"]`)?.focus();
  });

  const go = (i: number) => {
    const next = Math.max(0, Math.min(count - 1, i));
    const el = root.current;
    let t = top;
    if (next * itemHeight < t) t = next * itemHeight;
    else if ((next + 1) * itemHeight > t + height) t = (next + 1) * itemHeight - height;
    if (el) el.scrollTop = t;
    pending.current = true;
    setTop(t);
    setActive(next);
  };

  const keydown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(e);
    const t = e.target as HTMLElement;
    if (e.defaultPrevented || t.dataset.index === undefined) return;
    const at = Number(t.dataset.index);
    const page = Math.max(1, Math.floor(height / itemHeight) - 1);
    const to = {ArrowDown: at + 1, ArrowUp: at - 1, PageDown: at + page, PageUp: at - page, Home: 0, End: count - 1}[e.key];
    if (to === undefined) return;
    e.preventDefault();
    go(to);
  };

  return (
    <div
      ref={(el) => { root.current = el; if (typeof ref === 'function') ref(el); else if (ref) ref.current = el; }}
      role="list"
      className={cx('virtual-list', className)}
      style={{height, ...style}}
      onScroll={(e) => { onScroll?.(e); setTop(e.currentTarget.scrollTop); }}
      onKeyDown={keydown}
      {...rest}
    >
      <div role="presentation" className="virtual-list-body" style={{height: count * itemHeight}}>
        {rows.map((i) => (
          <div
            key={i}
            role="listitem"
            className="virtual-list-row"
            data-index={i}
            aria-posinset={i + 1}
            aria-setsize={count}
            tabIndex={i === stop ? 0 : -1}
            style={{top: i * itemHeight, height: itemHeight}}
            onFocus={(e) => { if (e.target === e.currentTarget) setActive(i); }}
          >{renderItem(i)}</div>
        ))}
      </div>
    </div>
  );
});
