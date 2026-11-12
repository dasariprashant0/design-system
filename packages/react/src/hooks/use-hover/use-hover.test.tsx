import {fireEvent, render, screen} from '@testing-library/react';
import {useHover} from './use-hover';

function Probe() {
  const [ref, hovered] = useHover<HTMLDivElement>();
  return <div ref={ref} data-testid="box">{hovered ? 'over' : 'out'}</div>;
}

describe('useHover', () => {
  it('follows mouseenter and mouseleave', () => {
    render(<Probe />);
    const el = screen.getByTestId('box');
    expect(el).toHaveTextContent('out');
    fireEvent.mouseEnter(el);
    expect(el).toHaveTextContent('over');
    fireEvent.mouseLeave(el);
    expect(el).toHaveTextContent('out');
  });
  it('cleans up on unmount without errors', () => {
    const {unmount} = render(<Probe />);
    expect(() => unmount()).not.toThrow();
  });
});
