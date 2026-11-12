import {render, screen, within} from '@testing-library/react';
import {axe} from '../../test/axe';
import {BlockFooter} from './block-footer';
import {createRef} from 'react';

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
  it('renders each link with its href inside the right column', () => {
    render(<BlockFooter columns={columns} />);
    const nav = screen.getByRole('navigation', {name: 'Company'});
    expect(within(nav).getByRole('link', {name: 'About'})).toHaveAttribute('href', '/about');
    expect(within(screen.getByRole('navigation', {name: 'Product'})).getByRole('link', {name: 'Changelog'})).toHaveAttribute('href', '/changelog');
  });
  it('omits the brand block when neither brand nor description is given', () => {
    const {container} = render(<BlockFooter columns={columns} />);
    expect(container.querySelector('.block-footer-brand')).toBeNull();
    expect(container.querySelector('.block-footer-legal')).toBeNull();
  });
  it('renders the brand block with only a description or only a brand', () => {
    const {container, rerender} = render(<BlockFooter columns={[]} brand="B" />);
    expect(container.querySelector('.block-footer-name')).toHaveTextContent('B');
    expect(container.querySelector('.block-footer-brand p')).toBeNull();
    rerender(<BlockFooter columns={[]} description="D" />);
    expect(container.querySelector('.block-footer-name')).toBeNull();
    expect(screen.getByText('D')).toBeInTheDocument();
  });
  it('supports heading levels 2 to 6', () => {
    const {rerender} = render(<BlockFooter columns={columns} />);
    expect(screen.getAllByRole('heading', {level: 2})).toHaveLength(2);
    rerender(<BlockFooter columns={columns} headingLevel={6} />);
    expect(screen.getAllByRole('heading', {level: 6})).toHaveLength(2);
  });
  it('renders no navs for no columns and a column with no links as an empty list', () => {
    const {rerender} = render(<BlockFooter columns={[]} />);
    expect(screen.queryAllByRole('navigation')).toHaveLength(0);
    rerender(<BlockFooter columns={[{title: 'Empty', links: []}]} />);
    expect(screen.getByRole('navigation', {name: 'Empty'})).toBeInTheDocument();
    expect(screen.queryAllByRole('link')).toHaveLength(0);
  });
  it('merges className and forwards a ref to the footer', () => {
    const ref = createRef<HTMLElement>();
    render(<BlockFooter ref={ref} className="mine" columns={columns} />);
    expect(ref.current!.tagName).toBe('FOOTER');
    expect(ref.current).toHaveClass('block-footer', 'mine');
  });
  it('has no axe violations', async () => {
    const {container} = render(<BlockFooter brand="Brand" columns={columns} legal="© 2026" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
