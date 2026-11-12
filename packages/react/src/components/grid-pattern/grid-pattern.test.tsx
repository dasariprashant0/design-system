import {createRef} from 'react';
import {render} from '@testing-library/react';
import {axe} from '../../test/axe';
import {GridPattern} from './grid-pattern';

describe('GridPattern', () => {
  it('is decorative: hidden from assistive tech and not focusable', () => {
    const {container} = render(<GridPattern />);
    const svg = container.querySelector('svg')!;
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).toHaveAttribute('focusable', 'false');
  });
  it('sizes the cell from `size` and strokes with currentColor', () => {
    const {container} = render(<GridPattern size={48} />);
    expect(container.querySelector('pattern')).toHaveAttribute('width', '48');
    expect(container.querySelector('path')).toHaveAttribute('stroke', 'currentColor');
  });
  it('gives each instance its own pattern id', () => {
    const {container} = render(<><GridPattern /><GridPattern /></>);
    const ids = [...container.querySelectorAll('pattern')].map((p) => p.id);
    expect(new Set(ids).size).toBe(2);
  });
  it('adds the fade class, merges className and forwards the ref', () => {
    const ref = createRef<SVGSVGElement>();
    render(<GridPattern ref={ref} fade className="x" />);
    expect(ref.current).toHaveClass('grid-pattern', 'grid-pattern-fade', 'x');
  });
  it('defaults to a 32px cell and draws the L-shaped line for any size', () => {
    const {container, rerender} = render(<GridPattern />);
    expect(container.querySelector('pattern')).toHaveAttribute('width', '32');
    expect(container.querySelector('path')).toHaveAttribute('d', 'M 32 0 H 0 V 32');
    rerender(<GridPattern size={10} />);
    expect(container.querySelector('path')).toHaveAttribute('d', 'M 10 0 H 0 V 10');
    expect(container.querySelector('pattern')).toHaveAttribute('height', '10');
  });
  it('fills the svg with the pattern it defines and does not fill the path', () => {
    const {container} = render(<GridPattern />);
    const id = container.querySelector('pattern')!.id;
    expect(id).toMatch(/^grid-[^:]+$/);
    expect(container.querySelector('rect')).toHaveAttribute('fill', `url(#${id})`);
    expect(container.querySelector('path')).toHaveAttribute('fill', 'none');
  });
  it('has no fade class by default and passes svg props through', () => {
    const {container} = render(<GridPattern width={20} />);
    expect(container.querySelector('svg')).not.toHaveClass('grid-pattern-fade');
    expect(container.querySelector('svg')).toHaveAttribute('width', '20');
  });
  it('keeps the pattern id stable across re-renders', () => {
    const {container, rerender} = render(<GridPattern />);
    const id = container.querySelector('pattern')!.id;
    rerender(<GridPattern size={8} />);
    expect(container.querySelector('pattern')!.id).toBe(id);
  });
  it('has no axe violations', async () => {
    const {container} = render(<GridPattern />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
