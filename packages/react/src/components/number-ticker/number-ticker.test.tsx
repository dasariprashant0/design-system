import {createRef} from 'react';
import {render} from '@testing-library/react';
import {axe} from '../../test/axe';
import {NumberTicker} from './number-ticker';

function reduced(on: boolean) {
  window.matchMedia = ((q: string) => ({matches: on, media: q, addEventListener() {}, removeEventListener() {}})) as unknown as typeof window.matchMedia;
}
afterEach(() => { delete (window as {matchMedia?: unknown}).matchMedia; });

describe('NumberTicker', () => {
  it('gives assistive tech the final number once, and hides the frames', () => {
    const {container} = render(<NumberTicker value={1200} />);
    expect(container.querySelector('.sr-only')).toHaveTextContent('1,200');
    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
  });
  it('shows the final value immediately for reduced motion', () => {
    reduced(true);
    const {container} = render(<NumberTicker value={1200} />);
    expect(container.querySelector('[aria-hidden="true"]')).toHaveTextContent('1,200');
  });
  it('starts at `from` when motion is allowed', () => {
    reduced(false);
    const {container} = render(<NumberTicker value={50} from={10} />);
    expect(container.querySelector('[aria-hidden="true"]')).toHaveTextContent('10');
  });
  it('formats with decimals or a custom function', () => {
    reduced(true);
    const {container, rerender} = render(<NumberTicker value={3.14159} decimals={2} />);
    expect(container.querySelector('.sr-only')).toHaveTextContent('3.14');
    rerender(<NumberTicker value={5} format={(n) => `$${n}`} />);
    expect(container.querySelector('.sr-only')).toHaveTextContent('$5');
  });
  it('forwards its ref and merges className', () => {
    const ref = createRef<HTMLSpanElement>();
    render(<NumberTicker ref={ref} value={1} className="x" />);
    expect(ref.current).toHaveClass('number-ticker', 'x');
  });
  it('has no axe violations', async () => {
    const {container} = render(<NumberTicker value={10} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
