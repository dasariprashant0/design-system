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
  const runToEnd = () => {
    let frames = 0;
    while (raf.mock.calls.length > frames && frames < 500) { const cb = raf.mock.calls[frames]![0] as () => void; frames += 1; cb(); }
    return frames;
  };
  it('sizes the canvas to the window when firing', () => {
    const ref = createRef<ConfettiHandle>();
    const {container} = render(<Confetti ref={ref} />);
    ref.current!.fire();
    const c = container.querySelector('canvas')!;
    expect(c.width).toBe(window.innerWidth);
    expect(c.height).toBe(window.innerHeight);
  });
  it('draws exactly `count` pieces in the given colours', () => {
    const ref = createRef<ConfettiHandle>();
    render(<Confetti ref={ref} count={7} colors={['red', 'blue']} />);
    const fills: string[] = [];
    Object.defineProperty(ctx, 'fillStyle', {configurable: true, get: () => '', set: (v: string) => fills.push(v)});
    ref.current!.fire();
    (raf.mock.calls[0]![0] as () => void)();
    expect(ctx.fillRect).toHaveBeenCalledTimes(7);
    expect(new Set(fills)).toEqual(new Set(['red', 'blue']));
    Object.defineProperty(ctx, 'fillStyle', {configurable: true, writable: true, value: ''});
  });
  it('count=0 draws nothing and stops straight away', () => {
    const ref = createRef<ConfettiHandle>();
    render(<Confetti ref={ref} count={0} />);
    ref.current!.fire();
    (raf.mock.calls[0]![0] as () => void)();
    expect(ctx.fillRect).not.toHaveBeenCalled();
    expect(raf).toHaveBeenCalledTimes(1);
  });
  it('starts every piece at the origin (translate on the first frame moves from it)', () => {
    const ref = createRef<ConfettiHandle>();
    render(<Confetti ref={ref} count={1} origin={{x: 0, y: 0}} />);
    ref.current!.fire();
    (raf.mock.calls[0]![0] as () => void)();
    const [x, y] = ctx.translate.mock.calls[0]!;
    expect(Math.abs(x)).toBeLessThan(20);
    expect(Math.abs(y)).toBeLessThan(20);
  });
  it('animates until every piece has expired, then stops requesting frames and clears', () => {
    const ref = createRef<ConfettiHandle>();
    render(<Confetti ref={ref} count={5} />);
    ref.current!.fire();
    const frames = runToEnd();
    expect(frames).toBeGreaterThan(60);
    expect(frames).toBeLessThan(200);
    expect(raf).toHaveBeenCalledTimes(frames);
    expect(ctx.clearRect).toHaveBeenCalled();
  });
  it('cancels the running animation on unmount', () => {
    const ref = createRef<ConfettiHandle>();
    const {unmount} = render(<Confetti ref={ref} />);
    ref.current!.fire();
    const cancel = globalThis.cancelAnimationFrame as unknown as ReturnType<typeof vi.fn>;
    cancel.mockClear();
    unmount();
    expect(cancel).toHaveBeenCalledWith(1);
  });
  it('a second burst cancels the first one rather than stacking loops', () => {
    const ref = createRef<ConfettiHandle>();
    render(<Confetti ref={ref} />);
    ref.current!.fire();
    ref.current!.fire();
    expect(globalThis.cancelAnimationFrame).toHaveBeenCalled();
  });
  it('re-reads the latest props at fire time', () => {
    const ref = createRef<ConfettiHandle>();
    const {rerender} = render(<Confetti ref={ref} count={2} />);
    rerender(<Confetti ref={ref} count={9} />);
    ref.current!.fire();
    (raf.mock.calls[0]![0] as () => void)();
    expect(ctx.fillRect).toHaveBeenCalledTimes(9);
  });
  it('is safe when the canvas has no 2d context', () => {
    getContext.mockReturnValue(null);
    const ref = createRef<ConfettiHandle>();
    render(<Confetti ref={ref} />);
    expect(() => ref.current!.fire()).not.toThrow();
    expect(raf).not.toHaveBeenCalled();
  });
  it('is safe when requestAnimationFrame does not exist (server-like env)', () => {
    vi.stubGlobal('requestAnimationFrame', undefined);
    const ref = createRef<ConfettiHandle>();
    render(<Confetti ref={ref} />);
    expect(() => ref.current!.fire()).not.toThrow();
    expect(getContext).not.toHaveBeenCalled();
  });
  it('merges className and spreads canvas props', () => {
    const {container} = render(<Confetti className="mine" data-testid="c" style={{zIndex: 5}} />);
    const c = container.querySelector('canvas')!;
    expect(c).toHaveClass('confetti', 'mine');
    expect(c.style.zIndex).toBe('5');
  });
  it('has no axe violations', async () => {
    const {container} = render(<Confetti />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
