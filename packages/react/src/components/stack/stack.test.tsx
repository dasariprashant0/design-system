import {render, screen} from '@testing-library/react';
import {axe} from '../../test/axe';
import {Stack} from './stack';

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
  it('has no axe violations', async () => {
    const {container} = render(<Stack>content</Stack>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
