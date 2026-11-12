import {render, screen} from '@testing-library/react';
import {axe} from '../../test/axe';
import {Text} from './text';

describe('Text', () => {
  it('renders a paragraph with size and tone classes', () => {
    render(<Text size="sm" tone="muted">Hello</Text>);
    const el = screen.getByText('Hello');
    expect(el.tagName).toBe('P');
    expect(el).toHaveClass('text', 'text-sm', 'text-muted');
  });
  it('supports truncate and asChild', () => {
    render(<Text asChild truncate><span>Long</span></Text>);
    expect(screen.getByText('Long').tagName).toBe('SPAN');
    expect(screen.getByText('Long')).toHaveClass('text-truncate');
  });
  it('has no axe violations', async () => {
    const {container} = render(<Text>Body</Text>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
