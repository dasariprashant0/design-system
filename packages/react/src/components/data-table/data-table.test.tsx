import {render, screen, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {useState} from 'react';
import {axe} from '../../test/axe';
import {DataTable, type DataTableColumn, type DataTableSort} from './data-table';

interface P {id: string; name: string; n: number}
const data: P[] = [{id: 'a', name: 'Ada', n: 3}, {id: 'b', name: 'Grace', n: 9}, {id: 'c', name: 'Alan', n: 1}];
const columns: DataTableColumn<P>[] = [{id: 'name', header: 'Name', sortable: true}, {id: 'n', header: 'Count', sortable: true, align: 'end'}, {id: 'x', header: 'Plain', cell: (r) => <em>{r.name}!</em>}];
const names = () => screen.getAllByRole('row').slice(1).map((r) => within(r).getAllByRole('cell')[0]!.textContent);
const namesSel = () => screen.getAllByRole('row').slice(1).map((r) => within(r).getAllByRole('cell')[1]!.textContent);

describe('DataTable', () => {
  it('renders rows, headers and custom cells', () => {
    render(<DataTable label="People" columns={columns} data={data} />);
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(names()).toEqual(['Ada', 'Grace', 'Alan']);
    expect(screen.getByText('Ada!')).toBeInTheDocument();
  });
  it('sorts via real buttons, cycling asc, desc, none, with aria-sort', async () => {
    const user = userEvent.setup();
    render(<DataTable label="People" columns={columns} data={data} />);
    const th = screen.getByRole('columnheader', {name: 'Name'});
    expect(th).toHaveAttribute('aria-sort', 'none');
    expect(screen.getByRole('columnheader', {name: 'Plain'})).not.toHaveAttribute('aria-sort');
    const btn = within(th).getByRole('button');
    await user.click(btn);
    expect(th).toHaveAttribute('aria-sort', 'ascending');
    expect(names()).toEqual(['Ada', 'Alan', 'Grace']);
    await user.click(btn);
    expect(th).toHaveAttribute('aria-sort', 'descending');
    expect(names()).toEqual(['Grace', 'Alan', 'Ada']);
    await user.click(btn);
    expect(names()).toEqual(['Ada', 'Grace', 'Alan']);
  });
  it('sorts with the keyboard and sorts numbers numerically', async () => {
    const user = userEvent.setup();
    render(<DataTable label="People" columns={columns} data={data} />);
    await user.tab(); // scroll region
    await user.tab(); // first sort button
    await user.tab(); // second
    await user.keyboard('{Enter}');
    expect(screen.getByRole('columnheader', {name: 'Count'})).toHaveAttribute('aria-sort', 'ascending');
    expect(names()).toEqual(['Alan', 'Ada', 'Grace']);
  });
  it('works controlled and uncontrolled for sort', async () => {
    const user = userEvent.setup();
    const fn = vi.fn();
    render(<DataTable label="People" columns={columns} data={data} defaultSort={{id: 'name', direction: 'desc'}} onSortChange={fn} />);
    expect(names()).toEqual(['Grace', 'Alan', 'Ada']);
    await user.click(within(screen.getByRole('columnheader', {name: 'Count'})).getByRole('button'));
    expect(fn).toHaveBeenCalledWith({id: 'n', direction: 'asc'});
    function C() { const [s, setS] = useState<DataTableSort | null>(null); return <DataTable label="Ctl" columns={columns} data={data} sort={s} onSortChange={setS} />; }
    render(<C />);
    await user.click(within(screen.getAllByRole('columnheader', {name: 'Name'})[1]!).getByRole('button'));
    expect(screen.getAllByRole('columnheader', {name: 'Name'})[1]).toHaveAttribute('aria-sort', 'ascending');
  });
  it('selects rows and shows indeterminate on select-all', async () => {
    const user = userEvent.setup();
    const fn = vi.fn();
    render(<DataTable label="People" columns={columns} data={data} selectable onSelectionChange={fn} />);
    const all = screen.getByRole('checkbox', {name: 'Select all rows'});
    await user.click(screen.getByRole('checkbox', {name: 'Select row 2'}));
    expect(fn).toHaveBeenLastCalledWith(['b']);
    expect(all).toHaveAttribute('aria-checked', 'mixed');
    await user.click(all);
    expect(fn).toHaveBeenLastCalledWith(['b', 'a', 'c']);
    expect(all).toHaveAttribute('aria-checked', 'true');
    await user.click(all);
    expect(fn).toHaveBeenLastCalledWith([]);
    expect(namesSel()).toHaveLength(3);
  });
  it('supports controlled selection', async () => {
    const user = userEvent.setup();
    render(<DataTable label="People" columns={columns} data={data} selectable selection={['a']} />);
    expect(screen.getByRole('checkbox', {name: 'Select row 1'})).toBeChecked();
    await user.click(screen.getByRole('checkbox', {name: 'Select row 2'}));
    expect(screen.getByRole('checkbox', {name: 'Select row 2'})).not.toBeChecked(); // parent did not update
  });
  it('paginates client-side', async () => {
    const user = userEvent.setup();
    render(<DataTable label="People" columns={columns} data={data} pageSize={2} />);
    expect(names()).toEqual(['Ada', 'Grace']);
    await user.click(screen.getByRole('button', {name: 'Next'}));
    expect(names()).toEqual(['Alan']);
  });
  it('shows an empty state', () => {
    render(<DataTable label="People" columns={columns} data={[]} emptyTitle="Nothing here" />);
    expect(screen.getByRole('heading', {name: 'Nothing here'})).toBeInTheDocument();
  });
  it('forwards its ref', () => {
    const ref = {current: null as HTMLDivElement | null};
    render(<DataTable ref={ref} label="People" columns={columns} data={data} />);
    expect(ref.current).toHaveClass('data-table');
  });
  it('has no axe violations', async () => {
    const {container} = render(<DataTable label="People" columns={columns} data={data} selectable pageSize={2} defaultSort={{id: 'name', direction: 'asc'}} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
