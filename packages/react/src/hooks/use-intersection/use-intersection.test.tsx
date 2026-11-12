import {act, render, screen} from '@testing-library/react';
import {useIntersection} from './use-intersection';

let cb: IntersectionObserverCallback;
const disconnect = vi.fn();

beforeEach(() => {
  disconnect.mockClear();
  globalThis.IntersectionObserver = class {
    constructor(c: IntersectionObserverCallback) { cb = c; }
    observe() {} unobserve() {} disconnect = disconnect; takeRecords() { return []; }
  } as never;
});

function Probe({once}: {once?: boolean}) {
  const [ref, entry] = useIntersection<HTMLDivElement>({once});
  return <div ref={ref}>{entry?.isIntersecting ? 'visible' : 'hidden'}</div>;
}

describe('useIntersection', () => {
  it('reports visibility from the observer', () => {
    render(<Probe />);
    expect(screen.getByText('hidden')).toBeInTheDocument();
    act(() => cb([{isIntersecting: true} as IntersectionObserverEntry], {} as IntersectionObserver));
    expect(screen.getByText('visible')).toBeInTheDocument();
  });
  it('stops observing after the first hit with once', () => {
    render(<Probe once />);
    act(() => cb([{isIntersecting: true} as IntersectionObserverEntry], {} as IntersectionObserver));
    expect(disconnect).toHaveBeenCalled();
  });
  it('does not throw without IntersectionObserver', () => {
    // @ts-expect-error remove for this test
    delete globalThis.IntersectionObserver;
    render(<Probe />);
    expect(screen.getByText('hidden')).toBeInTheDocument();
  });
});
