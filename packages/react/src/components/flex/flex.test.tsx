import {render, screen} from '@testing-library/react';
import {axe} from '../../test/axe';
import {Flex} from './flex';
import {createRef} from 'react';

describe('Flex', () => {
  it('is a row by default', () => {
    render(<Flex data-testid="f">x</Flex>);
    const el = screen.getByTestId('f');
    expect(el).toHaveClass('flex');
    expect(el).toHaveAttribute('data-direction', 'row');
    expect(el).not.toHaveClass('flex-inline', 'flex-wrap');
  });
  it('sets direction, wrap, align, justify, inline and the gap token', () => {
    render(<Flex data-testid="f" direction="column-reverse" wrap inline align="baseline" justify="around" gap={4}>x</Flex>);
    const el = screen.getByTestId('f');
    expect(el).toHaveClass('flex-inline', 'flex-wrap');
    expect(el).toHaveAttribute('data-direction', 'column-reverse');
    expect(el).toHaveAttribute('data-align', 'baseline');
    expect(el).toHaveAttribute('data-justify', 'around');
    expect(el.style.getPropertyValue('--flex-gap')).toBe('var(--s4)');
  });
  it('forwards ref and supports asChild', () => {
    const ref = {current: null as HTMLDivElement | null};
    const {rerender} = render(<Flex ref={ref}>x</Flex>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    rerender(<Flex asChild><ul aria-label="l"><li>a</li></ul></Flex>);
    expect(screen.getByRole('list', {name: 'l'})).toHaveClass('flex');
  });
  it('has no align, justify or gap attributes unless asked', () => {
    render(<Flex data-testid="f">x</Flex>);
    const el = screen.getByTestId('f');
    expect(el).not.toHaveAttribute('data-align');
    expect(el).not.toHaveAttribute('data-justify');
    expect(el.style.getPropertyValue('--flex-gap')).toBe('');
    expect(el).not.toHaveClass('flex-wrap', 'flex-inline');
  });
  it('maps every direction, align and justify value to its data attribute', () => {
    for (const d of ['row', 'column', 'row-reverse', 'column-reverse'] as const) {
      const {unmount} = render(<Flex data-testid="f" direction={d} />);
      expect(screen.getByTestId('f')).toHaveAttribute('data-direction', d);
      unmount();
    }
    for (const a of ['start', 'center', 'end', 'stretch', 'baseline'] as const) {
      const {unmount} = render(<Flex data-testid="f" align={a} />);
      expect(screen.getByTestId('f')).toHaveAttribute('data-align', a);
      unmount();
    }
    for (const j of ['start', 'center', 'end', 'between', 'around'] as const) {
      const {unmount} = render(<Flex data-testid="f" justify={j} />);
      expect(screen.getByTestId('f')).toHaveAttribute('data-justify', j);
      unmount();
    }
  });
  it('maps every gap step to its spacing token', () => {
    for (let g = 1; g <= 9; g++) {
      const {unmount} = render(<Flex data-testid="f" gap={g as 1} />);
      expect(screen.getByTestId('f').style.getPropertyValue('--flex-gap')).toBe(`var(--s${g})`);
      unmount();
    }
  });
  it('toggles wrap and inline independently', () => {
    render(<Flex data-testid="f" wrap inline />);
    expect(screen.getByTestId('f')).toHaveClass('flex', 'flex-wrap', 'flex-inline');
  });
  it('keeps caller style next to the gap variable and lets it win', () => {
    render(<Flex data-testid="f" gap={2} style={{color: 'red', ['--flex-gap' as string]: '1px'}} />);
    const el = screen.getByTestId('f');
    expect(el.style.color).toBe('red');
    expect(el.style.getPropertyValue('--flex-gap')).toBe('1px');
  });
  it('asChild puts classes, data attributes and ref on the child', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Flex asChild ref={ref} direction="column" justify="between" gap={3} className="mine"><ul data-testid="u"><li>a</li></ul></Flex>);
    const u = screen.getByTestId('u');
    expect(ref.current).toBe(u);
    expect(u).toHaveClass('flex', 'mine');
    expect(u).toHaveAttribute('data-direction', 'column');
    expect(u).toHaveAttribute('data-justify', 'between');
    expect(u.style.getPropertyValue('--flex-gap')).toBe('var(--s3)');
    expect(screen.getByRole('list')).toBe(u);
  });
  it('renders empty', () => {
    render(<Flex data-testid="f" />);
    expect(screen.getByTestId('f')).toBeEmptyDOMElement();
  });
  it('has no axe violations', async () => {
    const {container} = render(<Flex>content</Flex>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
