import {act, render} from '@testing-library/react';
import {axe} from '../../test/axe';
import {Typewriter} from './typewriter';

function reduced(on: boolean) {
  window.matchMedia = ((q: string) => ({matches: on, media: q, addEventListener() {}, removeEventListener() {}})) as unknown as typeof window.matchMedia;
}
afterEach(() => { delete (window as {matchMedia?: unknown}).matchMedia; vi.useRealTimers(); });

const visible = (c: HTMLElement) => c.querySelector('[aria-hidden="true"]')!;

describe('Typewriter', () => {
  it('exposes the whole text to screen readers', () => {
    const {container} = render(<Typewriter text="Hello" />);
    expect(container.querySelector('.sr-only')).toHaveTextContent('Hello');
  });
  it('types one character at a time and calls onComplete', () => {
    vi.useFakeTimers();
    const onComplete = vi.fn();
    const {container} = render(<Typewriter text="Hey" speed={10} onComplete={onComplete} />);
    expect(visible(container)).toHaveTextContent('');
    act(() => { vi.advanceTimersByTime(10); });
    expect(visible(container)).toHaveTextContent('H');
    act(() => { vi.advanceTimersByTime(20); });
    expect(visible(container)).toHaveTextContent('Hey');
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
  it('is static for reduced motion', () => {
    reduced(true);
    const onComplete = vi.fn();
    const {container} = render(<Typewriter text="Hello" onComplete={onComplete} />);
    expect(visible(container)).toHaveTextContent('Hello');
    expect(onComplete).toHaveBeenCalled();
  });
  it('can hide the caret', () => {
    reduced(true);
    const {container} = render(<Typewriter text="Hi" cursor={false} />);
    expect(container.querySelector('.typewriter-caret')).toBeNull();
  });
  describe('over time', () => {
    beforeEach(() => { vi.useFakeTimers(); reduced(false); });
    it('types at the given speed, one character per tick, starting empty', () => {
      const {container} = render(<Typewriter text="abc" speed={50} />);
      expect(visible(container)).toHaveTextContent('');
      act(() => { vi.advanceTimersByTime(49); });
      expect(visible(container)).toHaveTextContent('');
      act(() => { vi.advanceTimersByTime(1); });
      expect(visible(container)).toHaveTextContent('a');
      act(() => { vi.advanceTimersByTime(50); });
      expect(visible(container)).toHaveTextContent('ab');
      act(() => { vi.advanceTimersByTime(50); });
      expect(visible(container)).toHaveTextContent('abc');
    });
    it('waits `delay` before the first character', () => {
      const {container} = render(<Typewriter text="ab" speed={10} delay={200} />);
      act(() => { vi.advanceTimersByTime(199); });
      expect(visible(container)).toHaveTextContent('');
      act(() => { vi.advanceTimersByTime(1); });
      expect(visible(container)).toHaveTextContent('a');
      act(() => { vi.advanceTimersByTime(10); });
      expect(visible(container)).toHaveTextContent('ab');
    });
    it('calls onComplete exactly once and does not tick after finishing', () => {
      const onComplete = vi.fn();
      render(<Typewriter text="hi" speed={10} onComplete={onComplete} />);
      act(() => { vi.advanceTimersByTime(1000); });
      expect(onComplete).toHaveBeenCalledTimes(1);
      expect(vi.getTimerCount()).toBe(0);
    });
    it('does not call onComplete before the last character', () => {
      const onComplete = vi.fn();
      render(<Typewriter text="hello" speed={10} onComplete={onComplete} />);
      act(() => { vi.advanceTimersByTime(30); });
      expect(onComplete).not.toHaveBeenCalled();
    });
    it('uses the latest onComplete without restarting the typing', () => {
      const a = vi.fn(); const b = vi.fn();
      const {rerender, container} = render(<Typewriter text="abc" speed={10} onComplete={a} />);
      act(() => { vi.advanceTimersByTime(10); });
      rerender(<Typewriter text="abc" speed={10} onComplete={b} />);
      expect(visible(container)).toHaveTextContent('a');
      act(() => { vi.advanceTimersByTime(100); });
      expect(a).not.toHaveBeenCalled();
      expect(b).toHaveBeenCalledTimes(1);
    });
    it('clears its timer on unmount', () => {
      const onComplete = vi.fn();
      const {unmount} = render(<Typewriter text="long text here" speed={10} onComplete={onComplete} />);
      act(() => { vi.advanceTimersByTime(20); });
      unmount();
      expect(vi.getTimerCount()).toBe(0);
      vi.advanceTimersByTime(1000);
      expect(onComplete).not.toHaveBeenCalled();
    });
    it('restarts from empty when the text changes', () => {
      const {container, rerender} = render(<Typewriter text="first" speed={10} />);
      act(() => { vi.advanceTimersByTime(100); });
      expect(visible(container)).toHaveTextContent('first');
      rerender(<Typewriter text="second" speed={10} />);
      expect(visible(container)).toHaveTextContent('');
      act(() => { vi.advanceTimersByTime(100); });
      expect(visible(container)).toHaveTextContent('second');
    });
    it('keeps the sr-only copy complete at every frame', () => {
      const {container} = render(<Typewriter text="abc" speed={10} />);
      act(() => { vi.advanceTimersByTime(10); });
      expect(container.querySelector('.sr-only')).toHaveTextContent('abc');
    });
    it('empty text types nothing and completes', () => {
      const onComplete = vi.fn();
      const {container} = render(<Typewriter text="" speed={10} onComplete={onComplete} />);
      act(() => { vi.advanceTimersByTime(50); });
      expect(visible(container)).toHaveTextContent('');
      expect(onComplete).toHaveBeenCalledTimes(1);
    });
    it('never splits an emoji into a lone surrogate while typing', () => {
      const {container} = render(<Typewriter text="a😀b" speed={10} />);
      const seen: string[] = [];
      for (let i = 0; i < 5; i++) { act(() => { vi.advanceTimersByTime(10); }); seen.push(visible(container).textContent!); }
      expect(seen).toEqual(['a', 'a😀', 'a😀b', 'a😀b', 'a😀b']);
    });
    it('reduced motion changing while mounted jumps to the full text', () => {
      let listener: ((e: {matches: boolean}) => void) | undefined;
      window.matchMedia = ((q: string) => ({matches: false, media: q, addEventListener: (_: string, l: typeof listener) => { listener = l; }, removeEventListener() {}})) as unknown as typeof window.matchMedia;
      const {container} = render(<Typewriter text="hello" speed={100} />);
      act(() => { vi.advanceTimersByTime(100); });
      expect(visible(container)).toHaveTextContent('h');
      act(() => { listener!({matches: true}); });
      expect(visible(container)).toHaveTextContent('hello');
      expect(vi.getTimerCount()).toBe(0);
    });
  });
  it('reduced motion starts no timers at all', () => {
    vi.useFakeTimers();
    reduced(true);
    render(<Typewriter text="hello" />);
    expect(vi.getTimerCount()).toBe(0);
  });
  it('shows the caret by default, aria-hidden along with the typed text', () => {
    reduced(true);
    const {container} = render(<Typewriter text="x" />);
    expect(visible(container).querySelector('.typewriter-caret')).not.toBeNull();
  });
  it('merges className, forwards ref and spreads props', () => {
    reduced(true);
    const ref = {current: null as HTMLSpanElement | null};
    render(<Typewriter ref={ref} text="x" className="mine" data-x="1" />);
    expect(ref.current).toHaveClass('typewriter', 'mine');
    expect(ref.current).toHaveAttribute('data-x', '1');
  });
  it('handles RTL and very long text under reduced motion', () => {
    reduced(true);
    const long = 'مرحبا '.repeat(2000);
    const {container} = render(<Typewriter text={long} />);
    expect(visible(container).textContent).toBe(long);
  });
  it('has no axe violations', async () => {
    const {container} = render(<Typewriter text="Hello" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
