import {act, fireEvent, render, screen, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {afterEach, beforeAll, describe, expect, it, vi} from 'vitest';
import {axe} from '../../test/axe';
import {DataGrid, type DataGridColumn} from './data-grid';

interface Row { id: string; name: string; n: number }
const cols: DataGridColumn<Row>[] = [
  {id: 'name', header: 'Name', field: 'name', sortable: true},
  {id: 'n', header: 'Count', field: 'n', sortable: true, width: 80},
  {id: 'x', header: 'Plain', cell: (r) => `x${r.n}`},
];
const make = (count: number): Row[] => Array.from({length: count}, (_, i) => ({id: `r${i}`, name: `name ${i}`, n: (i * 37) % 101}));
const small = make(6);
const bodyRows = (c: HTMLElement) => Array.from(c.querySelectorAll('.data-grid-body-row'));
const firstIndex = (c: HTMLElement) => Number(bodyRows(c)[0]!.getAttribute('aria-rowindex'));

beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, 'clientHeight', {configurable: true, get() { return this.getAttribute?.('role') === 'grid' ? 200 : 0; }});
});
afterEach(() => vi.restoreAllMocks());

const grid = (props: Partial<React.ComponentProps<typeof DataGrid<Row>>> = {}) => <DataGrid<Row> aria-label="Things" columns={cols} rows={small} rowHeight={20} height={200} getRowId={(r) => r.id} {...props} />;
const cell = (row: number, col: number) => document.querySelector<HTMLElement>(`[data-row="${row}"][data-col="${col}"]`)!;

describe('DataGrid', () => {
  it('is a named grid with full-size aria and indexes', () => {
    render(grid());
    const g = screen.getByRole('grid', {name: 'Things'});
    expect(g).toHaveAttribute('aria-rowcount', '7');
    expect(g).toHaveAttribute('aria-colcount', '3');
    expect(screen.getAllByRole('columnheader').map((h) => h.getAttribute('aria-colindex'))).toEqual(['1', '2', '3']);
    expect(screen.getAllByRole('row')[0]).toHaveAttribute('aria-rowindex', '1');
    expect(screen.getAllByRole('row')[1]).toHaveAttribute('aria-rowindex', '2');
    expect(within(screen.getAllByRole('row')[1]!).getAllByRole('gridcell')[2]).toHaveAttribute('aria-colindex', '3');
  });
  it('mounts a bounded number of rows for 100000 and the window follows scrolling', () => {
    const {container} = render(grid({rows: make(100000)}));
    const g = screen.getByRole('grid');
    expect(g).toHaveAttribute('aria-rowcount', '100001');
    expect(bodyRows(container).length).toBeLessThanOrEqual(20);
    expect(bodyRows(container).length).toBeGreaterThan(5);
    expect(firstIndex(container)).toBe(2);
    g.scrollTop = 20 * 50000;
    fireEvent.scroll(g);
    expect(bodyRows(container).length).toBeLessThanOrEqual(20);
    expect(firstIndex(container)).toBeGreaterThan(49000);
  });
  it('sorts with aria-sort cycling and three states', async () => {
    const user = userEvent.setup();
    const onSortChange = vi.fn();
    const {container} = render(grid({onSortChange}));
    const th = screen.getByRole('columnheader', {name: 'Count'});
    expect(th).toHaveAttribute('aria-sort', 'none');
    expect(screen.getByRole('columnheader', {name: 'Plain'})).not.toHaveAttribute('aria-sort');
    const counts = () => bodyRows(container).map((r) => r.querySelector('[data-col="1"]')!.textContent);
    await user.click(th);
    expect(th).toHaveAttribute('aria-sort', 'ascending');
    expect(counts()).toEqual([...counts()].sort((a, b) => Number(a) - Number(b)));
    await user.click(th);
    expect(th).toHaveAttribute('aria-sort', 'descending');
    expect(counts()).toEqual([...counts()].sort((a, b) => Number(b) - Number(a)));
    await user.click(th);
    expect(th).toHaveAttribute('aria-sort', 'none');
    expect(onSortChange).toHaveBeenLastCalledWith(null);
  });
  it('sorts from the keyboard with Enter on a header', async () => {
    const user = userEvent.setup();
    render(grid());
    await user.tab();
    expect(cell(0, 0)).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('columnheader', {name: 'Name'})).toHaveAttribute('aria-sort', 'ascending');
  });
  it('manualSort leaves the order to the caller', async () => {
    const user = userEvent.setup();
    const {container} = render(grid({manualSort: true, rows: [{id: 'b', name: 'b', n: 2}, {id: 'a', name: 'a', n: 1}]}));
    await user.click(screen.getByRole('columnheader', {name: 'Name'}));
    expect(bodyRows(container)[0]).toHaveTextContent('b');
  });
  it('has one tab stop and roving focus with arrows, Home and End', async () => {
    const user = userEvent.setup();
    render(<><button>before</button>{grid()}<button>after</button></>);
    expect(document.querySelectorAll('[tabindex="0"][data-col]')).toHaveLength(1);
    await user.tab(); await user.tab();
    expect(cell(0, 0)).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(cell(1, 0)).toHaveFocus();
    expect(cell(1, 0)).toHaveAttribute('tabindex', '0');
    expect(cell(0, 0)).toHaveAttribute('tabindex', '-1');
    await user.keyboard('{ArrowRight}{ArrowRight}{ArrowRight}');
    expect(cell(1, 2)).toHaveFocus();
    await user.keyboard('{Home}');
    expect(cell(1, 0)).toHaveFocus();
    await user.keyboard('{End}');
    expect(cell(1, 2)).toHaveFocus();
    await user.keyboard('{ArrowUp}{ArrowUp}');
    expect(cell(0, 2)).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', {name: 'after'})).toHaveFocus();
  });
  it('Ctrl+End, Ctrl+Home and paging move through a large grid and scroll the window', async () => {
    const user = userEvent.setup();
    const {container} = render(grid({rows: make(1000)}));
    await user.tab();
    await user.keyboard('{Control>}{End}{/Control}');
    expect(cell(1000, 2)).toHaveFocus();
    expect(container.querySelector('[aria-rowindex="1001"]')).not.toBeNull();
    expect(bodyRows(container).length).toBeLessThanOrEqual(20);
    await user.keyboard('{Control>}{Home}{/Control}');
    expect(cell(0, 0)).toHaveFocus();
    await user.keyboard('{PageDown}');
    const afterPage = Number(document.activeElement!.getAttribute('data-row'));
    expect(afterPage).toBeGreaterThan(5);
    await user.keyboard('{PageUp}');
    expect(Number(document.activeElement!.getAttribute('data-row'))).toBe(0);
  });
  it('keeps the focused row mounted after scrolling away', async () => {
    const user = userEvent.setup();
    const {container} = render(grid({rows: make(1000)}));
    await user.tab();
    await user.keyboard('{ArrowDown}');
    const g = screen.getByRole('grid');
    g.scrollTop = 20 * 500;
    fireEvent.scroll(g);
    expect(container.querySelector('[data-row="1"]')).toHaveAttribute('tabindex', '0');
  });
  it('selects with Space and clicks', async () => {
    const user = userEvent.setup();
    const onSelectedIdsChange = vi.fn();
    render(grid({selectionMode: 'multiple', onSelectedIdsChange}));
    expect(screen.getByRole('grid')).toHaveAttribute('aria-multiselectable', 'true');
    await user.tab();
    await user.keyboard('{ArrowDown} ');
    expect(onSelectedIdsChange).toHaveBeenLastCalledWith(['r0']);
    await user.click(cell(3, 0));
    expect(onSelectedIdsChange).toHaveBeenLastCalledWith(['r0', 'r2']);
    expect(screen.getAllByRole('row')[1]).toHaveAttribute('aria-selected', 'true');
    expect(screen.getAllByRole('row')[2]).toHaveAttribute('aria-selected', 'false');
  });
  it('single selection replaces', async () => {
    const user = userEvent.setup();
    render(grid({selectionMode: 'single'}));
    await user.click(cell(1, 0));
    await user.click(cell(2, 0));
    expect(screen.getAllByRole('row').filter((r) => r.getAttribute('aria-selected') === 'true')).toHaveLength(1);
  });
  it('does not mark rows selectable without a selection mode', () => {
    render(grid());
    expect(screen.getAllByRole('row')[1]).not.toHaveAttribute('aria-selected');
  });
  it('shows an empty state', () => {
    render(grid({rows: []}));
    expect(screen.getByText('No rows')).toBeInTheDocument();
    expect(screen.getByRole('grid')).toHaveAttribute('aria-rowcount', '1');
  });
  it('applies column widths and forwards its ref', () => {
    const ref = {current: null as HTMLDivElement | null};
    render(grid({ref}));
    expect(ref.current).toBe(screen.getByRole('grid'));
    expect(ref.current!.style.getPropertyValue('--data-grid-cols')).toBe('minmax(120px, 1fr) 80px minmax(120px, 1fr)');
  });
  it('re-renders when rows shrink under the focused cell', async () => {
    const user = userEvent.setup();
    const {rerender} = render(grid({rows: make(50)}));
    await user.tab();
    await user.keyboard('{Control>}{End}{/Control}');
    await act(async () => rerender(grid({rows: make(3)})));
    expect(document.querySelectorAll('[tabindex="0"][data-col]')).toHaveLength(1);
  });
  it('has no axe violations', async () => {
    const {container} = render(grid({selectionMode: 'multiple'}));
    expect(await axe(container)).toHaveNoViolations();
  });
});
