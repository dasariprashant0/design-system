import {render, screen} from '@testing-library/react';
import {axe} from '../../test/axe';
import {Grid} from './grid';
import {createRef} from 'react';

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
  it('auto-fit sets the min column and no column count', () => {
    render(<Grid data-testid="g" minColumn="10rem">x</Grid>);
    const g = screen.getByTestId('g');
    expect(g).toHaveClass('grid', 'grid-auto');
    expect(g).not.toHaveClass('grid-fixed');
    expect(g.style.getPropertyValue('--grid-min')).toBe('10rem');
    expect(g.style.getPropertyValue('--grid-cols')).toBe('');
  });
  it('defaults gap to step 4 and min column to 16rem', () => {
    render(<Grid data-testid="g">x</Grid>);
    const g = screen.getByTestId('g');
    expect(g.style.getPropertyValue('--grid-gap')).toBe('var(--s4)');
    expect(g.style.getPropertyValue('--grid-min')).toBe('16rem');
  });
  it('maps every column count 1 to 6 and switches to the fixed class', () => {
    for (let c = 1; c <= 6; c++) {
      const {unmount} = render(<Grid data-testid="g" columns={c as 1}>x</Grid>);
      const g = screen.getByTestId('g');
      expect(g).toHaveClass('grid-fixed');
      expect(g).not.toHaveClass('grid-auto');
      expect(g.style.getPropertyValue('--grid-cols')).toBe(String(c));
      unmount();
    }
  });
  it('maps every gap step', () => {
    for (let s = 1; s <= 9; s++) {
      const {unmount} = render(<Grid data-testid="g" gap={s as 1}>x</Grid>);
      expect(screen.getByTestId('g').style.getPropertyValue('--grid-gap')).toBe(`var(--s${s})`);
      unmount();
    }
  });
  it('keeps caller style and className, forwards ref', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Grid ref={ref} className="mine" style={{color: 'red'}} data-testid="g" />);
    expect(ref.current).toBe(screen.getByTestId('g'));
    expect(ref.current).toHaveClass('grid', 'mine');
    expect(ref.current!.style.color).toBe('red');
  });
  it('renders empty and many children', () => {
    render(<Grid data-testid="g">{Array.from({length: 100}, (_, i) => <i key={i} />)}</Grid>);
    expect(screen.getByTestId('g').children).toHaveLength(100);
  });
  it('has no axe violations', async () => {
    const {container} = render(<Grid>content</Grid>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
