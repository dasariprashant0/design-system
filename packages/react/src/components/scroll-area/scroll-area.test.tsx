import {render, screen} from '@testing-library/react';
import {axe} from '../../test/axe';
import {ScrollArea} from './scroll-area';

describe('ScrollArea', () => {
  it('renders children in a focusable viewport', () => {
    render(<ScrollArea style={{height: 40}} viewportProps={{'aria-label': 'Log'}}><p>line</p></ScrollArea>);
    const vp = screen.getByLabelText('Log');
    expect(vp).toHaveAttribute('tabindex', '0');
    expect(vp).toHaveTextContent('line');
  });
  it('forwards ref and className', () => {
    const ref = {current: null as HTMLDivElement | null};
    render(<ScrollArea ref={ref} className="x">a</ScrollArea>);
    expect(ref.current).toHaveClass('scroll-area', 'x');
  });
  it('has no axe violations', async () => {
    const {container} = render(<ScrollArea viewportProps={{'aria-label': 'Log'}}><p>line</p></ScrollArea>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
