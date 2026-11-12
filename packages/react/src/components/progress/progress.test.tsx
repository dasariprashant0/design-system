import {render, screen} from '@testing-library/react';
import {axe} from '../../test/axe';
import {Progress} from './progress';
import {createRef} from 'react';

describe('Progress', () => {
  it('exposes value, min and max', () => {
    render(<Progress aria-label="Upload" value={62} />);
    const bar = screen.getByRole('progressbar', {name: 'Upload'});
    expect(bar).toHaveAttribute('aria-valuenow', '62');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
  });
  it('is indeterminate without a value', () => {
    render(<Progress aria-label="Waiting" />);
    const bar = screen.getByRole('progressbar');
    expect(bar).not.toHaveAttribute('aria-valuenow');
    expect(bar).toHaveAttribute('data-state', 'indeterminate');
  });
  it('clamps the fill width', () => {
    const {container} = render(<Progress aria-label="x" value={250} />);
    expect(container.querySelector('.progress-fill')).toHaveStyle({width: '100%'});
  });
  it('sets the fill width from value and max', () => {
    const {container, rerender} = render(<Progress aria-label="x" value={25} max={50} />);
    expect(container.querySelector('.progress-fill')).toHaveStyle({width: '50%'});
    rerender(<Progress aria-label="x" value={0} />);
    expect(container.querySelector('.progress-fill')).toHaveStyle({width: '0%'});
  });
  it('reports data-state loading while in progress and complete at max', () => {
    const {rerender} = render(<Progress aria-label="x" value={10} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('data-state', 'loading');
    rerender(<Progress aria-label="x" value={100} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('data-state', 'complete');
  });
  it('indeterminate bars have no inline width so CSS can animate them', () => {
    const {container} = render(<Progress aria-label="x" />);
    expect((container.querySelector('.progress-fill') as HTMLElement).style.width).toBe('');
  });
  it('treats an explicit null like no value', () => {
    render(<Progress aria-label="x" value={null} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('data-state', 'indeterminate');
  });
  it('clamps negative values to an empty fill', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const {container} = render(<Progress aria-label="x" value={-20} />);
    expect(container.querySelector('.progress-fill')).toHaveStyle({width: '0%'});
    spy.mockRestore();
  });
  it('respects a custom max in aria-valuemax', () => {
    render(<Progress aria-label="x" value={3} max={5} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuemax', '5');
    expect(bar).toHaveAttribute('aria-valuenow', '3');
  });
  it('is named by aria-label and forwards ref, className', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Progress ref={ref} aria-label="Upload" value={1} className="mine" />);
    expect(screen.getByRole('progressbar', {name: 'Upload'})).toBe(ref.current);
    expect(ref.current).toHaveClass('progress-bar', 'mine');
  });
  it('has no axe violations', async () => {
    const {container} = render(<Progress aria-label="Upload" value={40} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
