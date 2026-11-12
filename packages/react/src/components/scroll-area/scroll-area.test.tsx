import {render, screen} from '@testing-library/react';
import {axe} from '../../test/axe';
import {ScrollArea} from './scroll-area';
import {createRef} from 'react';
import userEvent from '@testing-library/user-event';

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
  it('puts the content in a keyboard-focusable viewport', async () => {
    const user = userEvent.setup();
    render(<ScrollArea><p>Long content</p></ScrollArea>);
    await user.tab();
    expect(screen.getByText('Long content').closest('.scroll-viewport')).toHaveFocus();
  });
  it('passes viewportProps (name, role) to the viewport and lets them override tabIndex', () => {
    render(<ScrollArea viewportProps={{'aria-label': 'Log', role: 'region', tabIndex: -1}}>x</ScrollArea>);
    const vp = screen.getByRole('region', {name: 'Log'});
    expect(vp).toHaveClass('scroll-viewport');
    expect(vp).toHaveAttribute('tabindex', '-1');
  });
  it('uses a plain root with the base class, merges className and spreads props', () => {
    const ref = createRef<HTMLDivElement>();
    render(<ScrollArea ref={ref} className="mine" data-testid="r" style={{height: 100}}>x</ScrollArea>);
    expect(ref.current).toBe(screen.getByTestId('r'));
    expect(ref.current).toHaveClass('scroll-area', 'mine');
    expect(ref.current!.style.height).toBe('100px');
  });
  it('renders content in the DOM even when it overflows or is empty', () => {
    render(<ScrollArea><div style={{height: 5000}}>tall</div></ScrollArea>);
    expect(screen.getByText('tall')).toBeInTheDocument();
    render(<ScrollArea viewportProps={{'data-testid': 'vp'} as never} />);
    expect(screen.getByTestId('vp')).toHaveTextContent('');
  });
  it('scrollbars only mount when content overflows (Radix type=hover default) and accept each orientation without crashing', () => {
    for (const orientation of ['vertical', 'horizontal', 'both'] as const) {
      const {unmount} = render(<ScrollArea orientation={orientation} type="always">x</ScrollArea>);
      const bars = document.querySelectorAll('.scroll-bar');
      expect(bars.length).toBe(orientation === 'both' ? 2 : 1);
      const dirs = [...bars].map((b) => b.getAttribute('data-orientation'));
      if (orientation === 'both') expect(dirs.sort()).toEqual(['horizontal', 'vertical']);
      else expect(dirs).toEqual([orientation]);
      unmount();
    }
  });
  it('has no axe violations', async () => {
    const {container} = render(<ScrollArea viewportProps={{'aria-label': 'Log'}}><p>line</p></ScrollArea>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
