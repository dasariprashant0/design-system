'use client';
import {forwardRef, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type HTMLAttributes, type KeyboardEvent, type ReactElement, type ReactNode, type Ref} from 'react';
import {cx} from '../../utils/cx';
import {EmptyState} from '../empty-state';

export interface DataGridColumn<T> {
  id: string;
  /** Plain text: it is the column header and its accessible name. */
  header: string;
  /** Key of the row to show when `cell` is not given. */
  field?: keyof T & string;
  /** Custom cell content. */
  cell?: (row: T, index: number) => ReactNode;
  /** The value sorting compares. Defaults to `row[field]`. */
  sortValue?: (row: T) => string | number | null | undefined;
  /** Pixels as a number, or any CSS grid track (`'2fr'`). Default: flexible, at least 120px. */
  width?: number | string;
  sortable?: boolean;
  align?: 'start' | 'end';
}

export interface DataGridSort { id: string; direction: 'asc' | 'desc' }

type Name = {'aria-label': string; 'aria-labelledby'?: string} | {'aria-labelledby': string; 'aria-label'?: string};

export type DataGridProps<T> = Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'aria-label' | 'aria-labelledby'> & Name & {
  columns: DataGridColumn<T>[];
  rows: T[];
  /** Stable id per row, used for selection. Default: the row's position in `rows`. */
  getRowId?: (row: T, index: number) => string;
  /** Row height in px. Every row has the same height; that is what makes virtualising cheap. Default 36. */
  rowHeight?: number;
  /** Height of the scrolling grid, header included. Default 400. */
  height?: number | string;
  /** Extra rows rendered above and below the visible ones. Default 5. */
  overscan?: number;
  selectionMode?: 'none' | 'single' | 'multiple';
  selectedIds?: string[];
  defaultSelectedIds?: string[];
  onSelectedIdsChange?: (ids: string[]) => void;
  /** Controlled sort; `null` is unsorted. */
  sort?: DataGridSort | null;
  defaultSort?: DataGridSort | null;
  onSortChange?: (sort: DataGridSort | null) => void;
  /** Do not sort in the grid: `rows` arrive already ordered (server-side sorting). */
  manualSort?: boolean;
  /** Shown when `rows` is empty. */
  emptyState?: ReactNode;
};

const collator = new Intl.Collator(undefined, {numeric: true});
const cmp = (a: unknown, b: unknown) => (a == null ? (b == null ? 0 : 1) : b == null ? -1 : typeof a === 'number' && typeof b === 'number' ? a - b : collator.compare(String(a), String(b)));
const MIN_COL = 120;
const track = (c: {width?: number | string}) => (typeof c.width === 'number' ? `${c.width}px` : (c.width ?? `minmax(${MIN_COL}px, 1fr)`));

function Chevron({dir}: {dir?: 'asc' | 'desc'}) {
  return <svg className="data-grid-sort" data-direction={dir} viewBox="0 0 10 10" width="10" height="10" aria-hidden="true" focusable="false"><path d="M2 6.5 5 3.5l3 3" fill="none" stroke="currentColor" strokeWidth="1.4" /></svg>;
}

/**
 * A virtualised grid for large data sets: only the visible rows (plus overscan) are in the DOM.
 * `role="grid"` with a roving tabindex: one Tab stop, arrow keys move between cells, Home/End and
 * Ctrl+Home/End jump, PageUp/PageDown move a screenful. The header row is the first row of the grid.
 * Rows have one fixed height; cell content should not wrap to a second line. `aria-rowcount` and
 * `aria-rowindex` tell assistive technology the full size. Column headers are focusable cells: Enter or Space sorts.
 * Choice: sorting is done here (stable, three states: ascending, descending, none) unless `manualSort`.
 * @example <DataGrid aria-label="Orders" columns={cols} rows={rows} height={480} getRowId={(r) => r.id} />
 */
function DataGridInner<T>(
  {columns, rows, getRowId, rowHeight = 36, height = 400, overscan = 5, selectionMode = 'none', selectedIds, defaultSelectedIds, onSelectedIdsChange, sort, defaultSort = null, onSortChange, manualSort, emptyState, className, style, onScroll, onKeyDown, ...rest}: DataGridProps<T>,
  ref: Ref<HTMLDivElement>,
) {
  const gridRef = useRef<HTMLDivElement | null>(null);
  const setRefs = useCallback((el: HTMLDivElement | null) => {
    gridRef.current = el;
    if (typeof ref === 'function') ref(el); else if (ref) (ref as {current: HTMLDivElement | null}).current = el;
  }, [ref]);
  const fallbackH = typeof height === 'number' ? height : 400;
  const [scrollTop, setScrollTop] = useState(0);
  const [viewport, setViewport] = useState(fallbackH);
  const [active, setActive] = useState({row: 0, col: 0}); // row 0 is the header
  const [innerSort, setInnerSort] = useState(defaultSort);
  const [innerSel, setInnerSel] = useState(defaultSelectedIds ?? []);
  const wantFocus = useRef(false);

  const curSort = sort !== undefined ? sort : innerSort;
  const selected = useMemo(() => new Set(selectedIds ?? innerSel), [selectedIds, innerSel]);
  const n = rows.length;
  const nCols = columns.length;

  // Sorted view as indices into `rows`. ponytail: sorts all rows on a sort change (fine to ~1e6); server-side sort via manualSort.
  const order = useMemo(() => {
    const idx = Array.from({length: n}, (_, i) => i);
    const col = curSort && !manualSort ? columns.find((c) => c.id === curSort.id) : undefined;
    if (!col) return idx;
    const val = (r: T) => (col.sortValue ? col.sortValue(r) : col.field ? (r[col.field] as unknown) : undefined);
    const keys = rows.map(val);
    const dir = curSort!.direction === 'asc' ? 1 : -1;
    return idx.sort((a, b) => dir * cmp(keys[a], keys[b]) || a - b);
  }, [rows, columns, curSort, manualSort, n]);

  useLayoutEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const measure = () => setViewport(el.clientHeight || fallbackH);
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [fallbackH]);

  const activeRow = Math.min(active.row, n);
  const activeCol = Math.min(active.col, Math.max(nCols - 1, 0));
  const start = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
  const end = Math.min(n, Math.ceil((scrollTop + viewport) / rowHeight) + overscan);
  const visible: number[] = [];
  for (let i = start; i < end; i++) visible.push(i);
  const keep = activeRow - 1; // the row holding the Tab stop stays mounted even when scrolled away
  if (keep >= 0 && (keep < start || keep >= end)) { if (keep < start) visible.unshift(keep); else visible.push(keep); }

  // After a keyboard move, focus the new cell once it is mounted.
  useEffect(() => {
    if (!wantFocus.current) return;
    const cell = gridRef.current?.querySelector<HTMLElement>(`[data-row="${activeRow}"][data-col="${activeCol}"]`);
    if (cell) { wantFocus.current = false; cell.focus({preventScroll: true}); }
  });

  const scrollTo = (top: number) => {
    const el = gridRef.current;
    const t = Math.max(0, top);
    if (el) el.scrollTop = t;
    setScrollTop(t);
  };
  const reveal = (row: number) => {
    if (row < 1) return;
    const top = (row - 1) * rowHeight; // body offset; the sticky header covers the first rowHeight of the viewport
    if (top < scrollTop) scrollTo(top);
    else if (top + 2 * rowHeight > scrollTop + viewport) scrollTo(top + 2 * rowHeight - viewport);
  };

  const move = (row: number, col: number) => {
    const r = Math.max(0, Math.min(n, row));
    const c = Math.max(0, Math.min(nCols - 1, col));
    wantFocus.current = true;
    reveal(r);
    setActive({row: r, col: c});
  };

  const toggleSort = (c: DataGridColumn<T>) => {
    const next: DataGridSort | null = curSort?.id !== c.id ? {id: c.id, direction: 'asc'} : curSort.direction === 'asc' ? {id: c.id, direction: 'desc'} : null;
    if (sort === undefined) setInnerSort(next);
    onSortChange?.(next);
  };

  const rowId = (vi: number) => { const i = order[vi]!; return getRowId ? getRowId(rows[i]!, i) : String(i); };
  const toggleRow = (id: string) => {
    if (selectionMode === 'none') return;
    const next = selectionMode === 'single' ? (selected.has(id) ? [] : [id]) : selected.has(id) ? [...selected].filter((x) => x !== id) : [...selected, id];
    if (selectedIds === undefined) setInnerSel(next);
    onSelectedIdsChange?.(next);
  };

  const handleKey = (e: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented || !(e.target as HTMLElement).hasAttribute('data-col')) return;
    const page = Math.max(1, Math.floor(viewport / rowHeight) - 1);
    const {row, col} = {row: activeRow, col: activeCol};
    const to = (r: number, c: number) => { e.preventDefault(); move(r, c); };
    switch (e.key) {
      case 'ArrowDown': return to(row + 1, col);
      case 'ArrowUp': return to(row - 1, col);
      case 'ArrowRight': return to(row, col + 1);
      case 'ArrowLeft': return to(row, col - 1);
      case 'PageDown': return to(row + page, col);
      case 'PageUp': return to(row - page, col);
      case 'Home': return to(e.ctrlKey || e.metaKey ? 0 : row, 0);
      case 'End': return to(e.ctrlKey || e.metaKey ? n : row, nCols - 1);
      case ' ':
      case 'Enter':
        if (row === 0) { e.preventDefault(); const c = columns[col]; if (c?.sortable) toggleSort(c); }
        else if (e.key === ' ' && selectionMode !== 'none') { e.preventDefault(); toggleRow(rowId(row - 1)); }
    }
  };

  const gridStyle = {height, overflow: 'auto', position: 'relative', '--data-grid-cols': columns.map(track).join(' '), '--data-grid-row': `${rowHeight}px`, ...style} as CSSProperties;
  const minWidth = columns.reduce((s, c) => s + (typeof c.width === 'number' ? c.width : MIN_COL), 0);
  const inner: CSSProperties = {minInlineSize: minWidth};

  return (
    <div
      ref={setRefs}
      role="grid"
      className={cx('data-grid', className)}
      style={gridStyle}
      aria-rowcount={n + 1}
      aria-colcount={nCols}
      aria-multiselectable={selectionMode === 'multiple' || undefined}
      onScroll={(e) => { setScrollTop(e.currentTarget.scrollTop); onScroll?.(e); }}
      onKeyDown={handleKey}
      {...rest}
    >
      <div role="rowgroup" className="data-grid-head" style={inner}>
        <div role="row" aria-rowindex={1} className="data-grid-row">
          {columns.map((c, ci) => {
            const dir = curSort?.id === c.id ? curSort.direction : undefined;
            const tab = activeRow === 0 && activeCol === ci;
            return (
              <div
                key={c.id}
                role="columnheader"
                aria-colindex={ci + 1}
                aria-sort={c.sortable ? (dir === 'asc' ? 'ascending' : dir === 'desc' ? 'descending' : 'none') : undefined}
                tabIndex={tab ? 0 : -1}
                data-row={0}
                data-col={ci}
                data-align={c.align}
                data-sortable={c.sortable ? '' : undefined}
                className="data-grid-cell data-grid-th"
                onFocus={() => setActive({row: 0, col: ci})}
                onClick={() => c.sortable && toggleSort(c)}
              >
                <span className="data-grid-text">{c.header}</span>
                {c.sortable && <Chevron dir={dir} />}
              </div>
            );
          })}
        </div>
      </div>
      <div role="rowgroup" className="data-grid-body" style={{...inner, blockSize: n === 0 ? undefined : n * rowHeight}}>
        {n === 0 && (
          <div role="row" aria-rowindex={2} className="data-grid-row data-grid-empty-row">
            <div role="gridcell" aria-colindex={1} aria-colspan={nCols || 1} className="data-grid-empty">{emptyState ?? <EmptyState title="No rows" />}</div>
          </div>
        )}
        {visible.map((vi) => {
          const i = order[vi]!;
          const row = rows[i]!;
          const id = rowId(vi);
          const isSel = selected.has(id);
          return (
            <div
              key={id}
              role="row"
              aria-rowindex={vi + 2}
              aria-selected={selectionMode === 'none' ? undefined : isSel}
              data-state={isSel ? 'selected' : undefined}
              className="data-grid-row data-grid-body-row"
              style={{insetBlockStart: vi * rowHeight}}
            >
              {columns.map((c, ci) => {
                const tab = activeRow === vi + 1 && activeCol === ci;
                const content = c.cell ? c.cell(row, i) : c.field != null ? (row[c.field] as ReactNode) : null;
                return (
                  <div
                    key={c.id}
                    role="gridcell"
                    aria-colindex={ci + 1}
                    tabIndex={tab ? 0 : -1}
                    data-row={vi + 1}
                    data-col={ci}
                    data-align={c.align}
                    className="data-grid-cell"
                    onFocus={() => setActive({row: vi + 1, col: ci})}
                    onClick={() => toggleRow(id)}
                  >
                    <span className="data-grid-text">{content}</span>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const DataGrid = forwardRef(DataGridInner) as <T>(props: DataGridProps<T> & {ref?: Ref<HTMLDivElement>}) => ReactElement;
