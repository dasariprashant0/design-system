import {render, screen} from '@testing-library/react';
import {axe} from '../../test/axe';
import {Heading} from './heading';
import {createRef} from 'react';

describe('Heading', () => {
  it('renders the requested level', () => {
    render(<Heading level={3}>Plans</Heading>);
    expect(screen.getByRole('heading', {level: 3, name: 'Plans'})).toBeInTheDocument();
  });
  it('separates level from size', () => {
    render(<Heading level={2} size="sm">Small h2</Heading>);
    const h = screen.getByRole('heading', {level: 2});
    expect(h).toHaveClass('heading-sm');
  });
  it('picks a default size from the level', () => {
    render(<Heading level={1}>Title</Heading>);
    expect(screen.getByRole('heading', {level: 1})).toHaveClass('heading-display');
  });
  it('defaults to an h2 with the xl look', () => {
    render(<Heading>T</Heading>);
    expect(screen.getByRole('heading', {level: 2})).toHaveClass('heading', 'heading-xl');
  });
  it('maps every level to its tag and default size', () => {
    const expected = {1: 'display', 2: 'xl', 3: 'lg', 4: 'md', 5: 'sm', 6: 'sm'} as const;
    for (const level of [1, 2, 3, 4, 5, 6] as const) {
      const {unmount} = render(<Heading level={level}>T</Heading>);
      const h = screen.getByRole('heading', {level});
      expect(h.tagName).toBe(`H${level}`);
      expect(h).toHaveClass(`heading-${expected[level]}`);
      unmount();
    }
  });
  it('an explicit size overrides the default and replaces it', () => {
    for (const size of ['display', 'xl', 'lg', 'md', 'sm'] as const) {
      const {unmount} = render(<Heading level={6} size={size}>T</Heading>);
      const h = screen.getByRole('heading', {level: 6});
      expect(h).toHaveClass(`heading-${size}`);
      expect(h.className.match(/heading-/g)).toHaveLength(1);
      unmount();
    }
  });
  it('forwards ref, merges className and spreads props such as id', () => {
    const ref = createRef<HTMLHeadingElement>();
    render(<Heading ref={ref} id="t" className="mine">T</Heading>);
    expect(ref.current).toHaveClass('heading', 'mine');
    expect(ref.current).toHaveAttribute('id', 't');
  });
  it('renders empty, long and RTL content', () => {
    render(<><Heading data-testid="e" /><Heading dir="rtl">{'عنوان '.repeat(500)}</Heading></>);
    expect(screen.getByTestId('e')).toBeEmptyDOMElement();
    expect(screen.getByText(/عنوان/)).toHaveAttribute('dir', 'rtl');
  });
  it('has no axe violations', async () => {
    const {container} = render(<Heading level={1}>Title</Heading>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
