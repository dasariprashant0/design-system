import {createRef} from 'react';
import {render, screen} from '@testing-library/react';
import {axe} from '../../test/axe';
import {BentoCard, BentoGrid} from './bento-grid';

describe('BentoGrid', () => {
  it('renders cards inside the grid', () => {
    render(<BentoGrid data-testid="g"><BentoCard>One</BentoCard><BentoCard>Two</BentoCard></BentoGrid>);
    expect(screen.getByTestId('g')).toHaveClass('bento-grid');
    expect(screen.getByText('Two')).toHaveClass('bento-card');
  });
  it('adds span classes only when asked', () => {
    render(<BentoGrid><BentoCard>Plain</BentoCard><BentoCard colSpan={2} rowSpan={2}>Big</BentoCard><BentoCard colSpan={3}>Wide</BentoCard></BentoGrid>);
    expect(screen.getByText('Plain').className).not.toMatch(/bento-(col|row)/);
    expect(screen.getByText('Big')).toHaveClass('bento-col-2', 'bento-row-2');
    expect(screen.getByText('Wide')).toHaveClass('bento-col-3');
  });
  it('merges className and forwards refs', () => {
    const g = createRef<HTMLDivElement>();
    const c = createRef<HTMLDivElement>();
    render(<BentoGrid ref={g} className="x"><BentoCard ref={c} className="y">a</BentoCard></BentoGrid>);
    expect(g.current).toHaveClass('bento-grid', 'x');
    expect(c.current).toHaveClass('bento-card', 'y');
  });
  it('has no axe violations', async () => {
    const {container} = render(<BentoGrid><BentoCard><h3>Title</h3><p>Body</p></BentoCard></BentoGrid>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
