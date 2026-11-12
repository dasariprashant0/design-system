import {createRef} from 'react';
import {render, screen} from '@testing-library/react';
import {axe} from '../../test/axe';
import {OrbitingCircles} from './orbiting-circles';

describe('OrbitingCircles', () => {
  it('is decorative: hidden from assistive tech', () => {
    const {container} = render(<OrbitingCircles><span>A</span></OrbitingCircles>);
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
    expect(screen.queryByText('A')).toBeInTheDocument();
  });
  it('places each child as an item with its index and the total', () => {
    const {container} = render(<OrbitingCircles><i>a</i><i>b</i><i>c</i></OrbitingCircles>);
    const items = container.querySelectorAll<HTMLElement>('.orbit-item');
    expect(items).toHaveLength(3);
    expect(items[2]!.style.getPropertyValue('--i')).toBe('2');
    expect((container.firstElementChild as HTMLElement).style.getPropertyValue('--n')).toBe('3');
  });
  it('sets radius and duration, and can reverse', () => {
    const {container} = render(<OrbitingCircles radius={50} duration={8} reverse><i>a</i></OrbitingCircles>);
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.getPropertyValue('--orbit-radius')).toBe('50px');
    expect(root.style.getPropertyValue('--orbit-duration')).toBe('8s');
    expect(root).toHaveClass('orbit-reverse');
  });
  it('renders the centre and can hide the ring', () => {
    const {container} = render(<OrbitingCircles center={<b>Core</b>} ring={false}><i>a</i></OrbitingCircles>);
    expect(container.querySelector('.orbit-center')).toHaveTextContent('Core');
    expect(container.querySelector('.orbit-ring')).toBeNull();
  });
  it('forwards its ref', () => {
    const ref = createRef<HTMLDivElement>();
    render(<OrbitingCircles ref={ref}><i>a</i></OrbitingCircles>);
    expect(ref.current).toHaveClass('orbit');
  });
  it('has no axe violations', async () => {
    const {container} = render(<OrbitingCircles center={<span>C</span>}><span>A</span><span>B</span></OrbitingCircles>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
