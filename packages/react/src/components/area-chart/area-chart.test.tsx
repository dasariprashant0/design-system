import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {axe} from '../../test/axe';
import {AreaChart} from './area-chart';

const labels = ['Jan', 'Feb', 'Mar'];
const series = [{name: 'Search', values: [3, 5, 4]}, {name: 'Email', values: [1, 2, 1]}];

describe('AreaChart', () => {
  it('names the image, fills each series and lists every value', () => {
    const {container} = render(<AreaChart title="Traffic" labels={labels} series={series} />);
    expect(screen.getByRole('img', {name: 'Traffic'})).toBeInTheDocument();
    expect(container.querySelectorAll('path.chart-area')).toHaveLength(2);
    expect(container.querySelectorAll('table.sr-only tbody tr')).toHaveLength(3);
  });
  it('stacks: the tooltip includes a total', async () => {
    const user = userEvent.setup();
    const {container} = render(<AreaChart title="x" stacked labels={labels} series={series} />);
    await user.tab();
    expect(container.querySelector('.chart-tip')).toHaveTextContent('Total');
    expect(container.querySelector('.chart-tip')).toHaveTextContent('4');
  });
  it('stacked areas use the running total for the axis', () => {
    const {container} = render(<AreaChart title="x" stacked labels={['a']} series={[{name: 'p', values: [60]}, {name: 'q', values: [60]}]} />);
    const ticks = Array.from(container.querySelectorAll('text.chart-tick')).map((t) => t.textContent);
    expect(ticks).toContain('150');
  });
  it('handles empty, single, negative and zero data', () => {
    const {container, rerender} = render(<AreaChart title="x" data={[]} />);
    expect(screen.getByText('No data')).toBeInTheDocument();
    for (const d of [[{label: 'a', value: 1}], [{label: 'a', value: -2}, {label: 'b', value: 3}], [{label: 'a', value: 0}, {label: 'b', value: 0}]]) {
      rerender(<AreaChart title="x" data={d} curve="step" />);
      expect(container.innerHTML).not.toContain('NaN');
    }
  });
  it('has no axe violations', async () => {
    const {container} = render(<AreaChart title="Traffic" stacked labels={labels} series={series} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
