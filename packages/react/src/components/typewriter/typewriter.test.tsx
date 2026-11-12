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
  it('has no axe violations', async () => {
    const {container} = render(<Typewriter text="Hello" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
