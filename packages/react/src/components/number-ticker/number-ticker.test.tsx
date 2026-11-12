import {createRef} from 'react';
import {render} from '@testing-library/react';
import {axe} from '../../test/axe';
import {NumberTicker} from './number-ticker';
import {act} from '@testing-library/react';

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
  const visible = (c: HTMLElement) => c.querySelector('[aria-hidden="true"]')!.textContent;
  let observers: {cb: IntersectionObserverCallback; disconnect: ReturnType<typeof vi.fn>; observe: ReturnType<typeof vi.fn>}[] = [];
  function stubIO() {
    observers = [];
    vi.stubGlobal('IntersectionObserver', class {
      disconnect = vi.fn(); observe = vi.fn();
      constructor(cb: IntersectionObserverCallback) { observers.push({cb, disconnect: this.disconnect, observe: this.observe}); }
    });
  }
  const enter = () => act(() => { observers[observers.length - 1]!.cb([{isIntersecting: true} as IntersectionObserverEntry], {} as IntersectionObserver); });
  describe('over time', () => {
    beforeEach(() => { vi.useFakeTimers(); reduced(false); });
    afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

    it('counts from `from` to `value` with easing and lands exactly on the value', () => {
      const {container} = render(<NumberTicker value={100} from={0} duration={1000} />);
      expect(visible(container)).toBe('0');
      act(() => { vi.advanceTimersByTime(500); });
      const mid = Number(visible(container));
      expect(mid).toBeGreaterThan(50);
      expect(mid).toBeLessThan(100);
      act(() => { vi.advanceTimersByTime(600); });
      expect(visible(container)).toBe('100');
    });
    it('keeps the screen-reader text on the final value throughout', () => {
      const {container} = render(<NumberTicker value={100} duration={1000} />);
      act(() => { vi.advanceTimersByTime(300); });
      expect(container.querySelector('.sr-only')).toHaveTextContent('100');
    });
    it('counts down when from > value', () => {
      const {container} = render(<NumberTicker value={0} from={50} duration={500} />);
      expect(visible(container)).toBe('50');
      act(() => { vi.advanceTimersByTime(600); });
      expect(visible(container)).toBe('0');
    });
    it('handles negative numbers and decimals', () => {
      const {container} = render(<NumberTicker value={-12.5} decimals={1} duration={200} />);
      act(() => { vi.advanceTimersByTime(300); });
      expect(visible(container)).toBe('-12.5');
    });
    it('waits until scrolled into view when IntersectionObserver exists, then runs', () => {
      stubIO();
      const {container} = render(<NumberTicker value={10} duration={500} />);
      act(() => { vi.advanceTimersByTime(2000); });
      expect(visible(container)).toBe('0');
      enter();
      act(() => { vi.advanceTimersByTime(600); });
      expect(visible(container)).toBe('10');
      expect(observers[0]!.disconnect).toHaveBeenCalled();
    });
    it('ignores non-intersecting callbacks', () => {
      stubIO();
      const {container} = render(<NumberTicker value={10} duration={500} />);
      act(() => { observers[0]!.cb([{isIntersecting: false} as IntersectionObserverEntry], {} as IntersectionObserver); vi.advanceTimersByTime(1000); });
      expect(visible(container)).toBe('0');
    });
    it('reduced motion shows the final value at once and never observes', () => {
      stubIO();
      reduced(true);
      const {container} = render(<NumberTicker value={42} />);
      expect(visible(container)).toBe('42');
      expect(observers.every((o) => o.observe.mock.calls.length === 0 || o.disconnect.mock.calls.length > 0)).toBe(true);
      act(() => { vi.advanceTimersByTime(5000); });
      expect(visible(container)).toBe('42');
    });
    it('cleans up the observer and the frame loop on unmount', () => {
      stubIO();
      const {unmount} = render(<NumberTicker value={10} duration={500} />);
      enter();
      act(() => { vi.advanceTimersByTime(100); });
      expect(vi.getTimerCount()).toBeGreaterThan(0);
      unmount();
      expect(observers[0]!.disconnect).toHaveBeenCalled();
      expect(vi.getTimerCount()).toBe(0);
    });
    it('stops updating after unmount (no timers left running)', () => {
      const {unmount} = render(<NumberTicker value={10} duration={500} />);
      act(() => { vi.advanceTimersByTime(100); });
      unmount();
      expect(vi.getTimerCount()).toBe(0);
    });
    it('restarts when the value changes', () => {
      const {container, rerender} = render(<NumberTicker value={10} duration={200} />);
      act(() => { vi.advanceTimersByTime(300); });
      expect(visible(container)).toBe('10');
      rerender(<NumberTicker value={20} duration={200} />);
      act(() => { vi.advanceTimersByTime(300); });
      expect(visible(container)).toBe('20');
    });
    it('duration 0 jumps to the value instead of showing NaN', () => {
      const {container} = render(<NumberTicker value={7} duration={0} />);
      act(() => { vi.advanceTimersByTime(50); });
      expect(visible(container)).toBe('7');
    });
    it('responds to reduced motion changing while mounted', () => {
      let listener: ((e: {matches: boolean}) => void) | undefined;
      window.matchMedia = ((q: string) => ({matches: false, media: q, addEventListener: (_: string, l: typeof listener) => { listener = l; }, removeEventListener() {}})) as unknown as typeof window.matchMedia;
      const {container} = render(<NumberTicker value={99} duration={5000} />);
      act(() => { vi.advanceTimersByTime(100); });
      expect(visible(container)).not.toBe('99');
      act(() => { listener!({matches: true}); });
      expect(visible(container)).toBe('99');
    });
  });
  it('formats huge numbers and zero', () => {
    reduced(true);
    const {container, rerender} = render(<NumberTicker value={1e12} />);
    expect(container.querySelector('.sr-only')).toHaveTextContent((1e12).toLocaleString());
    rerender(<NumberTicker value={0} />);
    expect(visible(container)).toBe('0');
  });
  it('custom format receives the animated value and overrides decimals', () => {
    reduced(true);
    const fmt = vi.fn((n: number) => `<${n}>`);
    const {container} = render(<NumberTicker value={3} decimals={4} format={fmt} />);
    expect(visible(container)).toBe('<3>');
    expect(fmt).toHaveBeenCalledWith(3);
  });
  it('supports a callback ref', () => {
    let node: HTMLSpanElement | null = null;
    render(<NumberTicker value={1} ref={(n) => { node = n; }} />);
    expect(node).toHaveClass('number-ticker');
  });
  it('has no axe violations', async () => {
    const {container} = render(<NumberTicker value={10} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
