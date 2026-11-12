import {render, screen} from '@testing-library/react';
import {axe} from '../../test/axe';
import {Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow} from './table';
import {createRef} from 'react';

const ui = () => (
  <Table wrapperLabel="Invoices">
    <TableCaption>March invoices</TableCaption>
    <TableHeader><TableRow><TableHead>Name</TableHead><TableHead numeric>Total</TableHead></TableRow></TableHeader>
    <TableBody><TableRow><TableCell>Ada</TableCell><TableCell numeric>$12</TableCell></TableRow></TableBody>
  </Table>
);

describe('Table', () => {
  it('renders a table with column headers and a caption', () => {
    render(ui());
    expect(screen.getByRole('table', {name: 'March invoices'})).toBeInTheDocument();
    expect(screen.getAllByRole('columnheader')).toHaveLength(2);
    expect(screen.getByRole('cell', {name: 'Ada'})).toBeInTheDocument();
  });
  it('marks numeric cells', () => {
    render(ui());
    expect(screen.getByRole('cell', {name: '$12'})).toHaveClass('num');
  });
  it('has a named, focusable scroll region', () => {
    render(ui());
    expect(screen.getByRole('region', {name: 'Invoices'})).toHaveAttribute('tabindex', '0');
  });
  const sample = (
    <Table>
      <TableHeader><TableRow><TableHead>Name</TableHead><TableHead numeric>Qty</TableHead></TableRow></TableHeader>
      <TableBody><TableRow><TableCell>Bolt</TableCell><TableCell numeric>12</TableCell></TableRow></TableBody>
    </Table>
  );
  it('exposes the native table roles with column headers scoped to col', () => {
    render(sample);
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getAllByRole('columnheader')).toHaveLength(2);
    screen.getAllByRole('columnheader').forEach((th) => expect(th).toHaveAttribute('scope', 'col'));
    expect(screen.getByRole('cell', {name: 'Bolt'})).toBeInTheDocument();
  });
  it('lets TableHead scope be overridden for row headers', () => {
    render(<Table><TableBody><TableRow><TableHead scope="row">Row</TableHead><TableCell>x</TableCell></TableRow></TableBody></Table>);
    expect(screen.getByRole('rowheader', {name: 'Row'})).toHaveAttribute('scope', 'row');
  });
  it('numeric adds the num class on head and cell only when set', () => {
    render(sample);
    expect(screen.getByRole('columnheader', {name: 'Qty'})).toHaveClass('num');
    expect(screen.getByRole('columnheader', {name: 'Name'})).not.toHaveClass('num');
    expect(screen.getByRole('cell', {name: '12'})).toHaveClass('num');
    expect(screen.getByRole('cell', {name: 'Bolt'}).className).toBe('');
  });
  it('wrapperLabel names the scroll region and defaults to Table', () => {
    const {rerender} = render(<Table>{null}</Table>);
    expect(screen.getByRole('region', {name: 'Table'})).toHaveAttribute('tabindex', '0');
    rerender(<Table wrapperLabel="Orders">{null}</Table>);
    expect(screen.getByRole('region', {name: 'Orders'})).toBeInTheDocument();
  });
  it('the scroll wrapper is keyboard focusable', async () => {
    const user = (await import('@testing-library/user-event')).default.setup();
    render(sample);
    await user.tab();
    expect(screen.getByRole('region')).toHaveFocus();
  });
  it('puts ref, className and other props on the table, not the wrapper', () => {
    const ref = createRef<HTMLTableElement>();
    render(<Table ref={ref} className="mine" id="t" aria-label="Parts">{null}</Table>);
    expect(ref.current).toBe(screen.getByRole('table', {name: 'Parts'}));
    expect(ref.current).toHaveClass('table', 'mine');
    expect(ref.current).toHaveAttribute('id', 't');
  });
  it('every part forwards its ref and spreads props', () => {
    const refs = {cap: createRef<HTMLTableCaptionElement>(), head: createRef<HTMLTableSectionElement>(), body: createRef<HTMLTableSectionElement>(), row: createRef<HTMLTableRowElement>(), th: createRef<HTMLTableCellElement>(), td: createRef<HTMLTableCellElement>()};
    render(
      <Table>
        <TableCaption ref={refs.cap} data-x="c">Cap</TableCaption>
        <TableHeader ref={refs.head}><TableRow ref={refs.row}><TableHead ref={refs.th} className="h">H</TableHead></TableRow></TableHeader>
        <TableBody ref={refs.body}><TableRow><TableCell ref={refs.td} className="d" colSpan={2}>D</TableCell></TableRow></TableBody>
      </Table>,
    );
    expect(refs.cap.current!.tagName).toBe('CAPTION');
    expect(refs.cap.current).toHaveAttribute('data-x', 'c');
    expect(refs.head.current!.tagName).toBe('THEAD');
    expect(refs.body.current!.tagName).toBe('TBODY');
    expect(refs.row.current!.tagName).toBe('TR');
    expect(refs.th.current).toHaveClass('h');
    expect(refs.td.current).toHaveClass('d');
    expect(refs.td.current).toHaveAttribute('colspan', '2');
  });
  it('names the table by its caption', () => {
    render(<Table><TableCaption>Inventory</TableCaption><TableBody><TableRow><TableCell>x</TableCell></TableRow></TableBody></Table>);
    expect(screen.getByRole('table', {name: 'Inventory'})).toBeInTheDocument();
  });
  it('handles zero, negative, long and RTL cell content and empty bodies', () => {
    render(<Table><TableBody><TableRow><TableCell numeric>{0}</TableCell><TableCell numeric>{-5}</TableCell><TableCell dir="rtl">{'نص '.repeat(300)}</TableCell></TableRow></TableBody></Table>);
    expect(screen.getByRole('cell', {name: '0'})).toBeInTheDocument();
    expect(screen.getByRole('cell', {name: '-5'})).toBeInTheDocument();
    expect(screen.getAllByRole('cell')).toHaveLength(3);
  });
  it('has no axe violations', async () => {
    const {container} = render(ui());
    expect(await axe(container)).toHaveNoViolations();
  });
});
