import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {axe} from '../../test/axe';
import {PieChart} from './pie-chart';

const data = [{label: 'Search', value: 50}, {label: 'Email', value: 30}, {label: 'Social', value: 20}];
const arcs = (c: HTMLElement) => (c.querySelector('path.chart-slice')?.getAttribute('d') ?? '').match(/A/g)?.length;

describe('PieChart', () => {
  it('names the image, draws a slice per value and lists values and shares', () => {
    const {container} = render(<PieChart title="Sources" data={data} />);
    expect(screen.getByRole('img', {name: 'Sources'})).toBeInTheDocument();
    expect(container.querySelectorAll('path.chart-slice')).toHaveLength(3);
    expect(container.querySelectorAll('table.sr-only tbody tr')).toHaveLength(3);
    expect(container.querySelector('table.sr-only')).toHaveTextContent('50%');
    expect(container.querySelectorAll('.chart-legend li')).toHaveLength(3);
  });
  it('a pie slice has one arc and a donut segment two', () => {
    const {container, rerender} = render(<PieChart title="x" data={data} />);
    expect(arcs(container)).toBe(1);
    rerender(<PieChart title="x" data={data} innerRadius={0.6} />);
    expect(arcs(container)).toBe(2);
  });
  it('skips zero slices in the drawing but keeps them in the table', () => {
    const {container} = render(<PieChart title="x" data={[...data, {label: 'None', value: 0}]} />);
    expect(container.querySelectorAll('path.chart-slice')).toHaveLength(3);
    expect(container.querySelectorAll('tbody tr')).toHaveLength(4);
  });
  it('shows No data when empty or all zero', () => {
    const {rerender} = render(<PieChart title="x" data={[]} />);
    expect(screen.getByText('No data')).toBeInTheDocument();
    rerender(<PieChart title="x" data={[{label: 'a', value: 0}]} />);
    expect(screen.getByText('No data')).toBeInTheDocument();
  });
  it('draws a single slice and huge values without NaN', () => {
    const {container} = render(<PieChart title="x" data={[{label: 'a', value: 5e15}]} />);
    expect(container.innerHTML).not.toContain('NaN');
    expect(container.querySelectorAll('path.chart-slice')).toHaveLength(1);
  });
  it('shows a tooltip on focus', async () => {
    const user = userEvent.setup();
    const {container} = render(<PieChart title="x" data={data} />);
    await user.tab();
    expect(screen.getByRole('img', {name: 'Search: 50 (50%)'})).toHaveFocus();
    expect(container.querySelector('.chart-tip')).toHaveTextContent('Search');
  });
  it('has no axe violations', async () => {
    const {container} = render(<PieChart title="Sources" data={data} innerRadius={0.5} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
