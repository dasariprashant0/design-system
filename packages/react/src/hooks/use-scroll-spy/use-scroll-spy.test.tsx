import {act, render, screen} from '@testing-library/react';
import {useScrollSpy} from './use-scroll-spy';

function Probe() {
  const active = useScrollSpy(['one', 'two', 'three'], 0);
  return <div><section id="one" /><section id="two" /><section id="three" /><output>{active ?? 'none'}</output></div>;
}

const tops: Record<string, number> = {one: 100, two: 400, three: 800};
beforeEach(() => {
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
    return {top: tops[this.id] ?? 0} as DOMRect;
  });
});
afterEach(() => vi.restoreAllMocks());

describe('useScrollSpy', () => {
  it('is null before any section reaches the top', () => {
    render(<Probe />);
    expect(screen.getByRole('status', {hidden: true}) ?? screen.getByText('none')).toBeTruthy();
    expect(screen.getByText('none')).toBeInTheDocument();
  });
  it('reports the last section scrolled past on scroll', () => {
    render(<Probe />);
    tops.one = -50; tops.two = -10; tops.three = 300;
    act(() => { window.dispatchEvent(new Event('scroll')); });
    expect(screen.getByText('two')).toBeInTheDocument();
    tops.one = 100; tops.two = 400; tops.three = 800;
  });
});
