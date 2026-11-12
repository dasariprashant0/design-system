import {render, screen} from '@testing-library/react';
import {axe} from '../../test/axe';
import {Link} from './link';
import {createRef} from 'react';
import userEvent from '@testing-library/user-event';

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
  it('internal links have no target or rel and no sr-only hint', () => {
    const {container} = render(<Link href="/docs">Docs</Link>);
    const a = screen.getByRole('link', {name: 'Docs'});
    expect(a).not.toHaveAttribute('target');
    expect(a).not.toHaveAttribute('rel');
    expect(container.querySelector('.sr-only')).toBeNull();
  });
  it('a caller target/rel win over the external defaults', () => {
    render(<Link href="https://x.test" external target="_self" rel="nofollow">X</Link>);
    const a = screen.getByRole('link');
    expect(a).toHaveAttribute('target', '_self');
    expect(a).toHaveAttribute('rel', 'nofollow');
  });
  it('merges className and forwards ref to the anchor', () => {
    const ref = createRef<HTMLAnchorElement>();
    render(<Link ref={ref} href="/" className="mine">Home</Link>);
    expect(ref.current!.tagName).toBe('A');
    expect(ref.current).toHaveClass('link', 'mine');
  });
  it('asChild applies external attributes to the child but adds no hint text', () => {
    const {container} = render(<Link asChild external><a href="/r">Router</a></Link>);
    const a = screen.getByRole('link', {name: 'Router'});
    expect(a).toHaveAttribute('target', '_blank');
    expect(a).toHaveAttribute('rel', 'noopener noreferrer');
    expect(container.querySelector('.sr-only')).toBeNull();
  });
  it('asChild works with a non-anchor child and keeps its handler', async () => {
    const onClick = vi.fn();
    render(<Link asChild><button onClick={onClick}>Act</button></Link>);
    screen.getByRole('button', {name: 'Act'}).click();
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button')).toHaveClass('link');
  });
  it('is keyboard focusable and fires click on Enter', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn((e: {preventDefault: () => void}) => e.preventDefault());
    render(<Link href="/x" onClick={onClick}>Go</Link>);
    await user.tab();
    expect(screen.getByRole('link')).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledTimes(1);
  });
  it('an anchor without href is not exposed as a link', () => {
    render(<Link>Nope</Link>);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
  it('handles long and RTL text', () => {
    render(<Link href="/" dir="rtl">{'رابط '.repeat(300)}</Link>);
    expect(screen.getByRole('link')).toHaveAttribute('dir', 'rtl');
  });
  it('has no axe violations', async () => {
    const {container} = render(<Link href="/docs">Docs</Link>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
