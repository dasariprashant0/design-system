import {render, screen} from '@testing-library/react';
import {axe} from '../../test/axe';
import {Stack} from './stack';
import {createRef} from 'react';

describe('Stack', () => {
  it('stacks in a column by default and sets the gap token', () => {
    render(<Stack data-testid="s" gap={5}>x</Stack>);
    const el = screen.getByTestId('s');
    expect(el).toHaveClass('stack');
    expect(el).not.toHaveClass('stack-row');
    expect(el.style.getPropertyValue('--stack-gap')).toBe('var(--s5)');
  });
  it('supports row, wrap, align and justify', () => {
    render(<Stack data-testid="s" direction="row" wrap align="center" justify="between">x</Stack>);
    const el = screen.getByTestId('s');
    expect(el).toHaveClass('stack-row', 'stack-wrap');
    expect(el).toHaveAttribute('data-align', 'center');
    expect(el).toHaveAttribute('data-justify', 'between');
  });
  it('forwards ref', () => {
    const ref = {current: null as HTMLDivElement | null};
    render(<Stack ref={ref}>x</Stack>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
  it('defaults: column, gap step 3, no align/justify, no wrap', () => {
    render(<Stack data-testid="s" />);
    const el = screen.getByTestId('s');
    expect(el.className).toBe('stack');
    expect(el.style.getPropertyValue('--stack-gap')).toBe('var(--s3)');
    expect(el).not.toHaveAttribute('data-align');
    expect(el).not.toHaveAttribute('data-justify');
  });
  it('maps every gap step', () => {
    for (let g = 1; g <= 9; g++) {
      const {unmount} = render(<Stack data-testid="s" gap={g as 1} />);
      expect(screen.getByTestId('s').style.getPropertyValue('--stack-gap')).toBe(`var(--s${g})`);
      unmount();
    }
  });
  it('maps every align and justify value', () => {
    for (const a of ['start', 'center', 'end', 'stretch'] as const) {
      const {unmount} = render(<Stack data-testid="s" align={a} />);
      expect(screen.getByTestId('s')).toHaveAttribute('data-align', a);
      unmount();
    }
    for (const j of ['start', 'center', 'end', 'between'] as const) {
      const {unmount} = render(<Stack data-testid="s" justify={j} />);
      expect(screen.getByTestId('s')).toHaveAttribute('data-justify', j);
      unmount();
    }
  });
  it('row and wrap are independent classes', () => {
    const {rerender} = render(<Stack data-testid="s" direction="row" />);
    expect(screen.getByTestId('s')).toHaveClass('stack-row');
    expect(screen.getByTestId('s')).not.toHaveClass('stack-wrap');
    rerender(<Stack data-testid="s" wrap />);
    expect(screen.getByTestId('s')).toHaveClass('stack-wrap');
    expect(screen.getByTestId('s')).not.toHaveClass('stack-row');
  });
  it('merges className, caller style (which can override the gap) and ref', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Stack ref={ref} className="mine" style={{color: 'red', ['--stack-gap' as string]: '2px'}} />);
    expect(ref.current).toHaveClass('stack', 'mine');
    expect(ref.current!.style.color).toBe('red');
    expect(ref.current!.style.getPropertyValue('--stack-gap')).toBe('2px');
  });
  it('keeps children in source order and renders empty', () => {
    const {container} = render(<><Stack data-testid="s"><i>1</i><i>2</i><i>3</i></Stack><Stack data-testid="e" /></>);
    expect([...screen.getByTestId('s').children].map((c) => c.textContent)).toEqual(['1', '2', '3']);
    expect(screen.getByTestId('e')).toBeEmptyDOMElement();
    expect(container).toBeTruthy();
  });
  it('has no axe violations', async () => {
    const {container} = render(<Stack>content</Stack>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
