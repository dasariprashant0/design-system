'use client';
import {forwardRef, useState, type HTMLAttributes, type ReactNode} from 'react';
import {cx} from '../../utils/cx';
import {Checkbox} from '../checkbox';
import {EmptyState} from '../empty-state';
import {Pagination} from '../pagination';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '../table';

export interface DataTableColumn<T> {
  id: string;
  header: ReactNode;
  /** Value used for sorting and as the default cell text. Defaults to `row[id]`. */
  accessor?: (row: T) => string | number | boolean | Date | null | undefined;
  /** Custom cell content. Defaults to the accessor value as text. */
  cell?: (row: T) => ReactNode;
  sortable?: boolean;
  align?: 'start' | 'end';
}

export interface DataTableSort {
  id: string;
  direction: 'asc' | 'desc';
}

export interface DataTableProps<T> extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** The column definitions: each has an `id`, a `header`, and optionally an `accessor`, a `cell` renderer, `sortable` and `align`. */
  columns: DataTableColumn<T>[];
  /** The rows to show; each row's `id` field (or `getRowId`) must be unique. */
  data: T[];
  /** Stable id for a row. Defaults to `row.id`, then the index. */
  getRowId?: (row: T, index: number) => string;
  /** Names the table for assistive tech. */
  label: string;
  /** Sort state. Controlled with `sort` + `onSortChange`, or uncontrolled with `defaultSort`. `null` means unsorted. */
  sort?: DataTableSort | null;
  /** The initial sort when uncontrolled, as `{id, direction}`. Default `null` (unsorted). */
  defaultSort?: DataTableSort | null;
  /** Called with the new sort (`null` when sorting is cleared) when the user clicks a sortable header. */
  onSortChange?: (sort: DataTableSort | null) => void;
  /** Adds a checkbox column. Selected row ids: controlled with `selection` + `onSelectionChange`, or uncontrolled with `defaultSelection`. */
  selectable?: boolean;
  /** Ids of the selected rows when controlled. Pair with `onSelectionChange` and `selectable`. */
  selection?: string[];
  /** Ids of the rows selected at first when uncontrolled. Default none. */
  defaultSelection?: string[];
  /** Called with the full list of selected row ids when the user checks or unchecks a row. */
  onSelectionChange?: (ids: string[]) => void;
  /** Rows per page. Omit to show every row. */
  pageSize?: number;
  /** Heading shown when there are no rows. Default "No results". */
  emptyTitle?: ReactNode;
  /** Optional sentence under the empty heading, for example how to add the first row. */
  emptyDescription?: ReactNode;
}

const cmp = (a: unknown, b: unknown) => {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
  return String(a).localeCompare(String(b), undefined, {numeric: true});
};

const Arrow = ({direction}: {direction?: 'asc' | 'desc'}) => (
  <svg className="data-table-sort" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" data-direction={direction}>
    <path d="M5 1.5v7M2 4.5l3-3 3 3" />
  </svg>
);

/**
 * A table with sortable columns, row selection and pagination, all client-side.
 * Clicking a sortable header cycles ascending, descending, unsorted.
 * @example <DataTable label="People" columns={[{id: 'name', header: 'Name', sortable: true}]} data={rows} pageSize={10} />
 */
export function DataTableInner<T>(
  {columns, data, getRowId, label, sort, defaultSort = null, onSortChange, selectable, selection, defaultSelection = [], onSelectionChange, pageSize, emptyTitle = 'No results', emptyDescription, className, ...rest}: DataTableProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const [innerSort, setInnerSort] = useState<DataTableSort | null>(defaultSort);
  const [innerSel, setInnerSel] = useState<string[]>(defaultSelection);
  const [page, setPage] = useState(1);
  const curSort = sort === undefined ? innerSort : sort;
  const curSel = selection ?? innerSel;

  const rows = data.map((row, i) => ({row, id: getRowId ? getRowId(row, i) : String((row as {id?: unknown}).id ?? i)}));
  const col = curSort && columns.find((c) => c.id === curSort.id);
  const value = (c: DataTableColumn<T>, row: T) => c.accessor ? c.accessor(row) : (row as Record<string, unknown>)[c.id];
  const sorted = col ? [...rows].sort((a, b) => cmp(value(col, a.row), value(col, b.row)) * (curSort!.direction === 'asc' ? 1 : -1)) : rows;
  const pageCount = pageSize ? Math.max(1, Math.ceil(sorted.length / pageSize)) : 1;
  const cur = Math.min(page, pageCount);
  const shown = pageSize ? sorted.slice((cur - 1) * pageSize, cur * pageSize) : sorted;

  const setSort = (next: DataTableSort | null) => { if (sort === undefined) setInnerSort(next); onSortChange?.(next); };
  const setSel = (next: string[]) => { if (selection === undefined) setInnerSel(next); onSelectionChange?.(next); };
  const toggleSort = (id: string) => {
    if (curSort?.id !== id) setSort({id, direction: 'asc'});
    else setSort(curSort.direction === 'asc' ? {id, direction: 'desc'} : null);
  };
  const pageIds = shown.map((r) => r.id);
  const nSel = pageIds.filter((id) => curSel.includes(id)).length;
  const allState = nSel === 0 ? false : nSel === pageIds.length ? true : 'indeterminate';
  const toggleAll = () => setSel(nSel === pageIds.length ? curSel.filter((id) => !pageIds.includes(id)) : [...new Set([...curSel, ...pageIds])]);
  const toggleRow = (id: string) => setSel(curSel.includes(id) ? curSel.filter((x) => x !== id) : [...curSel, id]);
  const span = columns.length + (selectable ? 1 : 0);

  return (
    <div ref={ref} className={cx('data-table', className)} {...rest}>
      <Table wrapperLabel={label}>
        <TableHeader>
          <TableRow>
            {selectable && <TableHead className="data-table-check"><Checkbox aria-label="Select all rows" checked={allState} onCheckedChange={toggleAll} disabled={pageIds.length === 0} /></TableHead>}
            {columns.map((c) => {
              const dir = curSort?.id === c.id ? curSort.direction : undefined;
              return (
                <TableHead key={c.id} numeric={c.align === 'end'} aria-sort={c.sortable ? (dir === 'asc' ? 'ascending' : dir === 'desc' ? 'descending' : 'none') : undefined}>
                  {c.sortable
                    ? <button type="button" className="data-table-sort-btn" onClick={() => toggleSort(c.id)}>{c.header}<Arrow direction={dir} /></button>
                    : c.header}
                </TableHead>
              );
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {shown.length === 0 && <TableRow><TableCell colSpan={span}><EmptyState title={emptyTitle} description={emptyDescription} /></TableCell></TableRow>}
          {shown.map(({row, id}, i) => (
            <TableRow key={id} data-state={curSel.includes(id) ? 'selected' : undefined}>
              {selectable && <TableCell className="data-table-check"><Checkbox aria-label={`Select row ${(cur - 1) * (pageSize ?? 0) + i + 1}`} checked={curSel.includes(id)} onCheckedChange={() => toggleRow(id)} /></TableCell>}
              {columns.map((c) => <TableCell key={c.id} numeric={c.align === 'end'}>{c.cell ? c.cell(row) : String(value(c, row) ?? '')}</TableCell>)}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {pageSize && pageCount > 1 && <div className="data-table-footer"><Pagination page={cur} pageCount={pageCount} onPageChange={setPage} /></div>}
      <p className="sr-only" role="status">{selectable ? `${curSel.length} selected` : ''}</p>
    </div>
  );
}

/** A sortable, selectable, paginated table built from `columns` and `data`; see `DataTableInner` for behaviour. */
export const DataTable = forwardRef(DataTableInner) as <T>(props: DataTableProps<T> & {ref?: React.Ref<HTMLDivElement>}) => ReturnType<typeof DataTableInner>;
