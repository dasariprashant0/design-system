import {createRef} from 'react';
import {render, screen} from '@testing-library/react';
import {axe} from '../../test/axe';
import {Sparkline} from './sparkline';

describe('Sparkline', () => {
  it('is an image named by title with a table row per value', () => {
    render(<Sparkline title="Signups" data={[1, 3, 2, 5]} />);
    expect(screen.getByRole('img', {name: 'Signups'})).toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(5);
  });
  it('uses labels in the table when given', () => {
    render(<Sparkline title="x" data={[1, 2]} labels={['Mon', 'Tue']} />);
    expect(screen.getByRole('rowheader', {name: 'Tue'})).toBeInTheDocument();
  });
  it('marks the last value and optionally fills the area', () => {
    const {container, rerender} = render(<Sparkline title="x" data={[1, 2]} />);
    expect(container.querySelector('.sparkline-dot')).toBeInTheDocument();
    expect(container.querySelector('.sparkline-area')).toBeNull();
    rerender(<Sparkline title="x" data={[1, 2]} area />);
    expect(container.querySelector('.sparkline-area')).toBeInTheDocument();
  });
  it('copes with one value, flat data, negatives and huge numbers', () => {
    for (const d of [[4], [2, 2, 2], [-3, 5, -1], [1e13, 2e13]]) {
      const {container, unmount} = render(<Sparkline title="x" data={d} />);
      expect(container.innerHTML).not.toContain('NaN');
      unmount();
    }
  });
  it('shows No data when empty', () => {
    render(<Sparkline title="x" data={[]} />);
    expect(screen.getByText('No data')).toBeInTheDocument();
  });
  it('forwards ref and sizes the svg', () => {
    const ref = createRef<HTMLSpanElement>();
    const {container} = render(<Sparkline ref={ref} title="x" data={[1, 2]} width={120} height={30} />);
    expect(ref.current).toHaveClass('sparkline');
    expect(container.querySelector('svg')).toHaveAttribute('width', '120');
  });
  it('has no axe violations', async () => {
    const {container} = render(<Sparkline title="Signups" data={[1, 3, 2]} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
