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
  it('has no axe violations', async () => {
    const {container} = render(<GridPattern />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
