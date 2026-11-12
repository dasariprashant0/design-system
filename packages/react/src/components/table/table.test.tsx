import {render, screen} from '@testing-library/react';
import {axe} from '../../test/axe';
import {Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow} from './table';

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
  it('has no axe violations', async () => {
    const {container} = render(ui());
    expect(await axe(container)).toHaveNoViolations();
  });
});
