import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {axe} from '../../test/axe';
import {LineChart} from './line-chart';

const labels = ['Mon', 'Tue', 'Wed'];
const series = [{name: 'Visits', values: [3, 5, 4]}, {name: 'Signups', values: [1, 2, 1]}];

describe('LineChart', () => {
  it('names the image and lists every value in a table', () => {
    const {container} = render(<LineChart title="Traffic" labels={labels} series={series} />);
    expect(screen.getByRole('img', {name: 'Traffic'})).toBeInTheDocument();
    expect(container.querySelectorAll('table.sr-only tbody tr')).toHaveLength(3);
    expect(container.querySelectorAll('table.sr-only tbody td')).toHaveLength(6);
    expect(container.querySelectorAll('.chart-legend li')).toHaveLength(2);
  });
  it('draws a dashed second series and optional points', () => {
    const {container, rerender} = render(<LineChart title="x" labels={labels} series={series} />);
    const lines = container.querySelectorAll('path.chart-line');
    expect(lines).toHaveLength(2);
    expect(lines[0]).not.toHaveAttribute('stroke-dasharray');
    expect(lines[1]).toHaveAttribute('stroke-dasharray');
    expect(container.querySelectorAll('.chart-point')).toHaveLength(0);
    rerender(<LineChart title="x" labels={labels} series={series} showPoints />);
    expect(container.querySelectorAll('.chart-point')).toHaveLength(6);
  });
  it('steps with H and V segments', () => {
    const {container} = render(<LineChart title="x" data={[{label: 'a', value: 1}, {label: 'b', value: 3}]} curve="step" />);
    expect(container.querySelector('path.chart-line')?.getAttribute('d')).toMatch(/H.*V/);
  });
  it('always marks a single point, and shows No data when empty', () => {
    const {container, rerender} = render(<LineChart title="x" data={[{label: 'a', value: 2}]} />);
    expect(container.querySelectorAll('.chart-point')).toHaveLength(1);
    expect(container.innerHTML).not.toContain('NaN');
    rerender(<LineChart title="x" data={[]} />);
    expect(screen.getByText('No data')).toBeInTheDocument();
  });
  it('copes with negatives, all zeros and huge numbers', () => {
    for (const v of [[-3, 4, -1], [0, 0, 0], [1e12, 3e12, 2e12]]) {
      const {container, unmount} = render(<LineChart title="x" labels={labels} series={[{name: 's', values: v}]} />);
      expect(container.innerHTML).not.toContain('NaN');
      unmount();
    }
  });
  it('shows the tooltip with every series on keyboard focus', async () => {
    const user = userEvent.setup();
    const {container} = render(<LineChart title="x" labels={labels} series={series} />);
    await user.tab();
    expect(screen.getByRole('img', {name: 'Mon: Visits 3, Signups 1'})).toHaveFocus();
    const tip = container.querySelector('.chart-tip')!;
    expect(tip).toHaveTextContent('Visits');
    expect(tip).toHaveTextContent('Signups');
  });
  it('has no axe violations', async () => {
    const {container} = render(<LineChart title="Traffic" labels={labels} series={series} showPoints />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
