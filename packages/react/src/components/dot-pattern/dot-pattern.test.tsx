import {createRef} from 'react';
import {render} from '@testing-library/react';
import {axe} from '../../test/axe';
import {DotPattern} from './dot-pattern';

describe('DotPattern', () => {
  it('is decorative: hidden from assistive tech and not focusable', () => {
    const {container} = render(<DotPattern />);
    const svg = container.querySelector('svg')!;
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).toHaveAttribute('focusable', 'false');
  });
  it('sizes the pattern from gap and radius', () => {
    const {container} = render(<DotPattern gap={20} radius={2} />);
    expect(container.querySelector('pattern')).toHaveAttribute('width', '20');
    expect(container.querySelector('circle')).toHaveAttribute('r', '2');
  });
  it('gives each instance its own pattern id', () => {
    const {container} = render(<><DotPattern /><DotPattern /></>);
    const ids = [...container.querySelectorAll('pattern')].map((p) => p.id);
    expect(new Set(ids).size).toBe(2);
  });
  it('adds the fade class, merges className and forwards the ref', () => {
    const ref = createRef<SVGSVGElement>();
    render(<DotPattern ref={ref} fade className="x" />);
    expect(ref.current).toHaveClass('dot-pattern', 'dot-pattern-fade', 'x');
  });
  it('uses the defaults gap 16 and radius 1', () => {
    const {container} = render(<DotPattern />);
    const p = container.querySelector('pattern')!;
    expect(p).toHaveAttribute('width', '16');
    expect(p).toHaveAttribute('height', '16');
    const c = container.querySelector('circle')!;
    expect(c).toHaveAttribute('cx', '8');
    expect(c).toHaveAttribute('cy', '8');
    expect(c).toHaveAttribute('r', '1');
  });
  it('centres the dot in the cell for any gap, including odd and fractional ones', () => {
    const {container} = render(<DotPattern gap={7} radius={2.5} />);
    expect(container.querySelector('circle')).toHaveAttribute('cx', '3.5');
    expect(container.querySelector('circle')).toHaveAttribute('r', '2.5');
  });
  it('fills the whole svg with the pattern it defines', () => {
    const {container} = render(<DotPattern />);
    const id = container.querySelector('pattern')!.id;
    expect(id).toMatch(/^dot-[^:]+$/);
    expect(container.querySelector('rect')).toHaveAttribute('fill', `url(#${id})`);
    expect(container.querySelector('rect')).toHaveAttribute('width', '100%');
  });
  it('paints with currentColor so the colour is inherited', () => {
    const {container} = render(<DotPattern />);
    expect(container.querySelector('circle')).toHaveAttribute('fill', 'currentColor');
  });
  it('does not add the fade class by default and lets callers pass svg props', () => {
    const {container} = render(<DotPattern data-testid="d" width={50} />);
    const s = container.querySelector('svg')!;
    expect(s).not.toHaveClass('dot-pattern-fade');
    expect(s).toHaveAttribute('width', '50');
  });
  it('zero radius still renders without throwing', () => {
    const {container} = render(<DotPattern radius={0} />);
    expect(container.querySelector('circle')).toHaveAttribute('r', '0');
  });
  it('has no axe violations', async () => {
    const {container} = render(<DotPattern />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
