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
  it('has no axe violations', async () => {
    const {container} = render(<DotPattern />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
