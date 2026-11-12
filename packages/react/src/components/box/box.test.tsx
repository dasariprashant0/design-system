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
  it('sets no padding variables when no padding is given', () => {
    render(<Box data-testid="b">x</Box>);
    const el = screen.getByTestId('b');
    expect(el.style.getPropertyValue('--box-px')).toBe('');
    expect(el.style.getPropertyValue('--box-py')).toBe('');
    expect(el).not.toHaveClass('box-border');
    expect(el).not.toHaveAttribute('data-border');
  });
  it('maps every step 1 to 9', () => {
    for (let s = 1; s <= 9; s++) {
      const {unmount} = render(<Box data-testid="b" padding={s as 1}>x</Box>);
      expect(screen.getByTestId('b').style.getPropertyValue('--box-px')).toBe(`var(--s${s})`);
      expect(screen.getByTestId('b').style.getPropertyValue('--box-py')).toBe(`var(--s${s})`);
      unmount();
    }
  });
  it('lets paddingY override padding independently of paddingX', () => {
    render(<Box data-testid="b" padding={2} paddingY={8}>x</Box>);
    const el = screen.getByTestId('b');
    expect(el.style.getPropertyValue('--box-px')).toBe('var(--s2)');
    expect(el.style.getPropertyValue('--box-py')).toBe('var(--s8)');
  });
  it('border=true adds the class without a side; each side sets data-border and the class', () => {
    const {rerender} = render(<Box data-testid="b" border>x</Box>);
    expect(screen.getByTestId('b')).not.toHaveAttribute('data-border');
    for (const side of ['top', 'right', 'bottom', 'left'] as const) {
      rerender(<Box data-testid="b" border={side}>x</Box>);
      expect(screen.getByTestId('b')).toHaveAttribute('data-border', side);
      expect(screen.getByTestId('b')).toHaveClass('box-border');
    }
    rerender(<Box data-testid="b" border={false}>x</Box>);
    expect(screen.getByTestId('b')).not.toHaveClass('box-border');
  });
  it('keeps caller style next to the variables', () => {
    render(<Box data-testid="b" padding={3} style={{color: 'red'}}>x</Box>);
    const el = screen.getByTestId('b');
    expect(el.style.color).toBe('red');
    expect(el.style.getPropertyValue('--box-px')).toBe('var(--s3)');
  });
  it('asChild merges className, style, border data and ref onto the child', () => {
    const ref = {current: null as HTMLDivElement | null};
    render(<Box asChild ref={ref} border="left" padding={5} className="mine"><aside className="child" data-testid="a">x</aside></Box>);
    const el = screen.getByTestId('a');
    expect(ref.current).toBe(el);
    expect(el).toHaveClass('box', 'child', 'mine', 'box-border');
    expect(el).toHaveAttribute('data-border', 'left');
    expect(el.style.getPropertyValue('--box-px')).toBe('var(--s5)');
  });
  it('renders empty', () => {
    render(<Box data-testid="b" />);
    expect(screen.getByTestId('b')).toBeEmptyDOMElement();
  });
  it('has no axe violations', async () => {
    const {container} = render(<Box padding={3}>content</Box>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
