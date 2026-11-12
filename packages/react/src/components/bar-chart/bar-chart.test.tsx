import {createRef} from 'react';
import {render, screen, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {axe} from '../../test/axe';
import {BarChart} from './bar-chart';

const data = [{label: 'Mon', value: 3}, {label: 'Tue', value: 5}, {label: 'Wed', value: 0}];
const series = [{name: 'A', values: [1, 2]}, {name: 'B', values: [3, 4]}];

describe('BarChart', () => {
  it('is an image named by title, with a table of every value', () => {
    const {container} = render(<BarChart title="Weekly visits" data={data} />);
    expect(screen.getByRole('img', {name: 'Weekly visits'})).toBeInTheDocument();
    const table = container.querySelector('table.sr-only') as HTMLElement;
    expect(within(table).getAllByRole('row')).toHaveLength(data.length + 1);
    expect(within(table).getByRole('rowheader', {name: 'Tue'})).toBeInTheDocument();
    expect(within(table).getByRole('cell', {name: '5'})).toBeInTheDocument();
  });
  it('draws one bar per value and a legend for several series', () => {
    const {container} = render(<BarChart title="x" labels={['a', 'b']} series={series} />);
    expect(container.querySelectorAll('.chart-bar')).toHaveLength(4);
    expect(container.querySelectorAll('.chart-legend li')).toHaveLength(2);
    expect(container.querySelectorAll('tbody tr')).toHaveLength(2);
  });
  it('has no legend for one series', () => {
    const {container} = render(<BarChart title="x" data={data} />);
    expect(container.querySelector('.chart-legend')).toBeNull();
  });
  it('stacked and horizontal layouts keep one bar per value', () => {
    const {container} = render(<BarChart title="x" labels={['a', 'b']} series={series} stacked orientation="horizontal" showValues />);
    expect(container.querySelectorAll('.chart-bar')).toHaveLength(4);
    expect(screen.getByText('4', {selector: 'text.chart-value'})).toBeInTheDocument();
  });
  it('shows value labels only when asked', () => {
    const {container, rerender} = render(<BarChart title="x" data={data} />);
    expect(container.querySelectorAll('text.chart-value')).toHaveLength(0);
    rerender(<BarChart title="x" data={data} showValues />);
    expect(container.querySelectorAll('text.chart-value')).toHaveLength(3);
  });
  it('shows No data when empty', () => {
    render(<BarChart title="Visits" data={[]} />);
    expect(screen.getByText('No data')).toBeInTheDocument();
    expect(screen.getByRole('img', {name: 'Visits: no data'})).toBeInTheDocument();
  });
  it('handles one point, negatives, all zeros and huge numbers', () => {
    for (const d of [[{label: 'a', value: 1}], [{label: 'a', value: -4}, {label: 'b', value: 2}], [{label: 'a', value: 0}, {label: 'b', value: 0}], [{label: 'a', value: 9e12}]]) {
      const {container, unmount} = render(<BarChart title="x" data={d} />);
      expect(container.innerHTML).not.toContain('NaN');
      expect(container.querySelectorAll('tbody tr')).toHaveLength(d.length);
      unmount();
    }
  });
  it('shows a tooltip on keyboard focus, moves with arrows and hides on Escape', async () => {
    const user = userEvent.setup();
    const {container} = render(<BarChart title="x" data={data} />);
    await user.tab();
    expect(screen.getByRole('img', {name: 'Mon: 3'})).toHaveFocus();
    expect(container.querySelector('.chart-tip')).toHaveTextContent('Mon');
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('img', {name: 'Tue: 5'})).toHaveFocus();
    expect(container.querySelector('.chart-tip')).toHaveTextContent('5');
    await user.keyboard('{Escape}');
    expect(container.querySelector('.chart-tip')).toBeNull();
  });
  it('shows a tooltip on hover', async () => {
    const user = userEvent.setup();
    const {container} = render(<BarChart title="x" data={data} />);
    await user.hover(screen.getByRole('img', {name: 'Tue: 5'}));
    expect(container.querySelector('.chart-tip')).toHaveTextContent('Tue');
    await user.unhover(screen.getByRole('img', {name: 'Tue: 5'}));
    expect(container.querySelector('.chart-tip')).toBeNull();
  });
  it('formats values with valueFormat', () => {
    render(<BarChart title="x" data={[{label: 'a', value: 5}]} valueFormat={(v) => `$${v}`} showValues />);
    expect(screen.getByText('$5', {selector: 'text.chart-value'})).toBeInTheDocument();
  });
  it('forwards ref and className', () => {
    const ref = createRef<HTMLDivElement>();
    render(<BarChart ref={ref} title="x" data={data} className="mine" />);
    expect(ref.current).toHaveClass('chart', 'mine');
  });
  it('has no axe violations', async () => {
    const {container} = render(<BarChart title="Visits" labels={['a', 'b']} series={series} showValues />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
