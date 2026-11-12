import {render, screen} from '@testing-library/react';
import {axe} from '../../test/axe';
import {Link} from './link';

describe('Link', () => {
  it('is a link with the class', () => {
    render(<Link href="/docs">Docs</Link>);
    const a = screen.getByRole('link', {name: 'Docs'});
    expect(a).toHaveAttribute('href', '/docs');
    expect(a).toHaveClass('link');
  });
  it('external links open safely and announce it', () => {
    render(<Link href="https://example.com" external>Example</Link>);
    const a = screen.getByRole('link', {name: /Example/});
    expect(a).toHaveAttribute('target', '_blank');
    expect(a).toHaveAttribute('rel', 'noopener noreferrer');
    expect(a).toHaveAccessibleName('Example (opens in a new tab)');
  });
  it('supports asChild', () => {
    render(<Link asChild><a href="/x">Child</a></Link>);
    expect(screen.getByRole('link', {name: 'Child'})).toHaveClass('link');
  });
  it('has no axe violations', async () => {
    const {container} = render(<Link href="/docs">Docs</Link>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
