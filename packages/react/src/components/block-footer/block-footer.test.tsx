import {render, screen, within} from '@testing-library/react';
import {axe} from '../../test/axe';
import {BlockFooter} from './block-footer';

const columns = [
  {title: 'Product', links: [{label: 'Docs', href: '/docs'}, {label: 'Changelog', href: '/changelog'}]},
  {title: 'Company', links: [{label: 'About', href: '/about'}]},
];

describe('BlockFooter', () => {
  it('renders a contentinfo landmark with a nav per column', () => {
    render(<BlockFooter brand="Brand" description="Plain tools." columns={columns} legal="© 2026 Example" />);
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    const nav = screen.getByRole('navigation', {name: 'Product'});
    expect(within(nav).getAllByRole('link')).toHaveLength(2);
    expect(within(nav).getByRole('heading', {level: 2, name: 'Product'})).toBeInTheDocument();
    expect(screen.getByRole('link', {name: 'About'})).toHaveAttribute('href', '/about');
    expect(screen.getByText('© 2026 Example')).toBeInTheDocument();
  });
  it('respects headingLevel and forwards ref', () => {
    const ref = {current: null as HTMLElement | null};
    render(<BlockFooter ref={ref} columns={columns} headingLevel={3} />);
    expect(screen.getAllByRole('heading', {level: 3})).toHaveLength(2);
    expect(ref.current).toBeInstanceOf(HTMLElement);
  });
  it('has no axe violations', async () => {
    const {container} = render(<BlockFooter brand="Brand" columns={columns} legal="© 2026" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
