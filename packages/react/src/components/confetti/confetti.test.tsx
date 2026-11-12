import {createRef} from 'react';
import {render} from '@testing-library/react';
import {axe} from '../../test/axe';
import {Confetti, type ConfettiHandle} from './confetti';

const ctx = {clearRect: vi.fn(), save: vi.fn(), restore: vi.fn(), translate: vi.fn(), rotate: vi.fn(), fillRect: vi.fn(), globalAlpha: 1, fillStyle: ''};
let getContext: ReturnType<typeof vi.fn>;
let raf: ReturnType<typeof vi.fn>;

function reduced(on: boolean) {
  window.matchMedia = ((q: string) => ({matches: on, media: q, addEventListener() {}, removeEventListener() {}})) as unknown as typeof window.matchMedia;
}
beforeEach(() => {
  getContext = vi.fn(() => ctx);
  HTMLCanvasElement.prototype.getContext = getContext as unknown as typeof HTMLCanvasElement.prototype.getContext;
  raf = vi.fn(() => 1);
  vi.stubGlobal('requestAnimationFrame', raf);
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
  Object.values(ctx).forEach((f) => typeof f === 'function' && (f as ReturnType<typeof vi.fn>).mockClear());
});
afterEach(() => { delete (window as {matchMedia?: unknown}).matchMedia; vi.unstubAllGlobals(); });

describe('Confetti', () => {
  it('is a decorative canvas that ignores the pointer', () => {
    const {container} = render(<Confetti />);
    const c = container.querySelector('canvas')!;
    expect(c).toHaveAttribute('aria-hidden', 'true');
    expect(c).toHaveClass('confetti');
  });
  it('throws a burst from the ref method', () => {
    const ref = createRef<ConfettiHandle>();
    render(<Confetti ref={ref} colors={['red']} />);
    ref.current!.fire();
    expect(getContext).toHaveBeenCalledWith('2d');
    expect(raf).toHaveBeenCalled();
    const step = raf.mock.calls[0]![0] as () => void;
    step();
    expect(ctx.fillRect).toHaveBeenCalledTimes(60);
  });
  it('fires when `burst` changes, not on mount', () => {
    const {rerender} = render(<Confetti burst={0} />);
    expect(raf).not.toHaveBeenCalled();
    rerender(<Confetti burst={1} />);
    expect(raf).toHaveBeenCalledTimes(1);
  });
  it('does nothing for reduced motion', () => {
    reduced(true);
    const ref = createRef<ConfettiHandle>();
    const {rerender} = render(<Confetti ref={ref} burst={0} />);
    ref.current!.fire();
    rerender(<Confetti ref={ref} burst={1} />);
    expect(getContext).not.toHaveBeenCalled();
    expect(raf).not.toHaveBeenCalled();
  });
  it('has no axe violations', async () => {
    const {container} = render(<Confetti />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
