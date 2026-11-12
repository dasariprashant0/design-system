import {render, screen} from '@testing-library/react';
import {axe} from '../../test/axe';
import {Grid} from './grid';

describe('Grid', () => {
  it('is auto-fit by default', () => {
    render(<Grid data-testid="g">x</Grid>);
    const el = screen.getByTestId('g');
    expect(el).toHaveClass('grid', 'grid-auto');
    expect(el.style.getPropertyValue('--grid-min')).toBe('16rem');
  });
  it('supports fixed columns and gap', () => {
    render(<Grid data-testid="g" columns={3} gap={6}>x</Grid>);
    const el = screen.getByTestId('g');
    expect(el).toHaveClass('grid-fixed');
    expect(el.style.getPropertyValue('--grid-cols')).toBe('3');
    expect(el.style.getPropertyValue('--grid-gap')).toBe('var(--s6)');
  });
  it('has no axe violations', async () => {
    const {container} = render(<Grid>content</Grid>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
