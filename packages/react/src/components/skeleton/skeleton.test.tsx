import {render, screen} from '@testing-library/react';
import {axe} from '../../test/axe';
import {Skeleton} from './skeleton';
import {createRef} from 'react';

describe('Skeleton', () => {
  it('is hidden from assistive tech and styled by variant', () => {
    const {container} = render(<><Skeleton /><Skeleton variant="hatch" /></>);
    const [a, b] = Array.from(container.children);
    expect(a).toHaveAttribute('aria-hidden', 'true');
    expect(b).toHaveClass('skeleton-hatch');
  });
  it('line is the default and adds no modifier classes', () => {
    const {container} = render(<Skeleton />);
    expect((container.firstElementChild as HTMLElement).className).toBe('skeleton');
  });
  it('block adds skeleton-block only', () => {
    const {container} = render(<Skeleton variant="block" />);
    expect(container.firstElementChild).toHaveClass('skeleton', 'skeleton-block');
    expect(container.firstElementChild).not.toHaveClass('skeleton-hatch');
  });
  it('hatch adds both the hatch and block classes', () => {
    const {container} = render(<Skeleton variant="hatch" />);
    expect(container.firstElementChild).toHaveClass('skeleton', 'skeleton-hatch', 'skeleton-block');
  });
  it('is a span, never announced, and not exposed in the accessibility tree', () => {
    const {container} = render(<Skeleton />);
    expect(container.firstElementChild!.tagName).toBe('SPAN');
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
  });
  it('merges className, caller style and ref', () => {
    const ref = createRef<HTMLSpanElement>();
    render(<Skeleton ref={ref} className="mine" style={{width: 120}} />);
    expect(ref.current).toHaveClass('skeleton', 'mine');
    expect(ref.current!.style.width).toBe('120px');
  });
  it('renders many in a loading region marked aria-busy without leaking text', () => {
    render(<div role="status" aria-busy="true" aria-label="Loading list">{Array.from({length: 50}, (_, i) => <Skeleton key={i} />)}</div>);
    expect(screen.getByRole('status', {name: 'Loading list'})).toHaveTextContent('');
  });
  it('has no axe violations', async () => {
    const {container} = render(<Skeleton />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
