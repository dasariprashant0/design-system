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
  it('uses the defaults radius 96px, duration 20s, ring on, no centre, no reverse', () => {
    const {container} = render(<OrbitingCircles><i>a</i></OrbitingCircles>);
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.getPropertyValue('--orbit-radius')).toBe('96px');
    expect(root.style.getPropertyValue('--orbit-duration')).toBe('20s');
    expect(root).not.toHaveClass('orbit-reverse');
    expect(container.querySelector('.orbit-ring')).not.toBeNull();
    expect(container.querySelector('.orbit-center')).toBeNull();
  });
  it('indexes items in order and counts them for even spacing', () => {
    const {container} = render(<OrbitingCircles>{['a', 'b', 'c', 'd'].map((s) => <i key={s}>{s}</i>)}</OrbitingCircles>);
    const items = [...container.querySelectorAll<HTMLElement>('.orbit-item')];
    expect(items.map((i) => i.style.getPropertyValue('--i'))).toEqual(['0', '1', '2', '3']);
    expect(items.map((i) => i.textContent)).toEqual(['a', 'b', 'c', 'd']);
    expect((container.firstElementChild as HTMLElement).style.getPropertyValue('--n')).toBe('4');
  });
  it('ignores null and false children when counting', () => {
    const {container} = render(<OrbitingCircles>{null}{false}<i>a</i></OrbitingCircles>);
    expect(container.querySelectorAll('.orbit-item')).toHaveLength(1);
    expect((container.firstElementChild as HTMLElement).style.getPropertyValue('--n')).toBe('1');
  });
  it('renders with no items (n = 0)', () => {
    const {container} = render(<OrbitingCircles />);
    expect(container.querySelectorAll('.orbit-item')).toHaveLength(0);
    expect((container.firstElementChild as HTMLElement).style.getPropertyValue('--n')).toBe('0');
  });
  it('renders a centre of 0 (only null/undefined hide it)', () => {
    const {container} = render(<OrbitingCircles center={0}><i>a</i></OrbitingCircles>);
    expect(container.querySelector('.orbit-center')).toHaveTextContent('0');
  });
  it('accepts zero and huge radii and fractional durations', () => {
    const {container} = render(<OrbitingCircles radius={0} duration={0.5} />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.getPropertyValue('--orbit-radius')).toBe('0px');
    expect(root.style.getPropertyValue('--orbit-duration')).toBe('0.5s');
  });
  it('merges className and caller style, spreads props, and stays aria-hidden', () => {
    const {container} = render(<OrbitingCircles className="mine" style={{color: 'red'}} data-x="1" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveClass('orbit', 'mine');
    expect(root.style.color).toBe('red');
    expect(root).toHaveAttribute('data-x', '1');
    expect(root).toHaveAttribute('aria-hidden', 'true');
  });
  it('has no axe violations', async () => {
    const {container} = render(<OrbitingCircles center={<span>C</span>}><span>A</span><span>B</span></OrbitingCircles>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
