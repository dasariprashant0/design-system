import {render, screen} from '@testing-library/react';
import {axe} from '../../test/axe';
import {Flex} from './flex';

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
  it('has no axe violations', async () => {
    const {container} = render(<Flex>content</Flex>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
