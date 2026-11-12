import {render, screen} from '@testing-library/react';
import {axe} from '../../test/axe';
import {Box} from './box';

describe('Box', () => {
  it('maps padding steps to spacing tokens', () => {
    render(<Box data-testid="b" padding={4} paddingX={6}>x</Box>);
    const el = screen.getByTestId('b');
    expect(el).toHaveClass('box');
    expect(el.style.getPropertyValue('--box-px')).toBe('var(--s6)');
    expect(el.style.getPropertyValue('--box-py')).toBe('var(--s4)');
  });
  it('draws a border all round or on one side', () => {
    const {rerender} = render(<Box data-testid="b" border>x</Box>);
    expect(screen.getByTestId('b')).toHaveClass('box-border');
    rerender(<Box data-testid="b" border="top">x</Box>);
    expect(screen.getByTestId('b')).toHaveAttribute('data-border', 'top');
  });
  it('merges className and forwards ref', () => {
    const ref = {current: null as HTMLDivElement | null};
    render(<Box ref={ref} className="extra" data-testid="b">x</Box>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(screen.getByTestId('b')).toHaveClass('box', 'extra');
  });
  it('supports asChild', () => {
    render(<Box asChild padding={2}><section aria-label="s">x</section></Box>);
    expect(screen.getByRole('region', {name: 's'})).toHaveClass('box');
  });
  it('has no axe violations', async () => {
    const {container} = render(<Box padding={3}>content</Box>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
