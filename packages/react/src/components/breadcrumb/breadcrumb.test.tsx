import {render, screen} from '@testing-library/react';
import {axe} from '../../test/axe';
import {Breadcrumb} from './breadcrumb';
import {createRef} from 'react';

const items = [{label: 'Home', href: '/'}, {label: 'Projects', href: '/p'}, {label: 'Monoline'}];

describe('Breadcrumb', () => {
  it('is a named navigation landmark with an ordered list', () => {
    render(<Breadcrumb items={items} />);
    expect(screen.getByRole('navigation', {name: 'Breadcrumb'})).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
  });
  it('links earlier items and marks the last as the current page', () => {
    render(<Breadcrumb items={items} />);
    expect(screen.getByRole('link', {name: 'Home'})).toHaveAttribute('href', '/');
    expect(screen.queryByRole('link', {name: 'Monoline'})).not.toBeInTheDocument();
    expect(screen.getByText('Monoline').closest('li')).toHaveAttribute('aria-current', 'page');
  });
  it('allows renaming the landmark', () => {
    render(<Breadcrumb items={items} aria-label="You are here" />);
    expect(screen.getByRole('navigation', {name: 'You are here'})).toBeInTheDocument();
  });
  it('renders a single item as the current page, not a link', () => {
    render(<Breadcrumb items={[{label: 'Home', href: '/'}]} />);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByText('Home').closest('li')).toHaveAttribute('aria-current', 'page');
  });
  it('does not link the last item even if it has an href', () => {
    render(<Breadcrumb items={[{label: 'A', href: '/a'}, {label: 'B', href: '/b'}]} />);
    expect(screen.getAllByRole('link')).toHaveLength(1);
    expect(screen.getByText('B').closest('li')).toHaveAttribute('aria-current', 'page');
  });
  it('renders a middle item without href as plain text', () => {
    render(<Breadcrumb items={[{label: 'A', href: '/a'}, {label: 'Group'}, {label: 'C'}]} />);
    expect(screen.queryByRole('link', {name: 'Group'})).not.toBeInTheDocument();
    expect(screen.getByText('Group')).toBeInTheDocument();
  });
  it('marks only the last item with aria-current', () => {
    const {container} = render(<Breadcrumb items={items} />);
    expect(container.querySelectorAll('[aria-current]')).toHaveLength(1);
  });
  it('renders an empty list for no items', () => {
    render(<Breadcrumb items={[]} />);
    expect(screen.getByRole('list')).toBeEmptyDOMElement();
  });
  it('accepts rich labels, long and RTL text', () => {
    render(<Breadcrumb items={[{label: <em>الرئيسية</em>, href: '/'}, {label: 'x'.repeat(2000)}]} />);
    expect(screen.getByRole('link', {name: 'الرئيسية'})).toBeInTheDocument();
  });
  it('forwards ref, merges className on the nav and spreads props', () => {
    const ref = createRef<HTMLElement>();
    render(<Breadcrumb ref={ref} items={items} className="mine" data-x="1" />);
    expect(ref.current!.tagName).toBe('NAV');
    expect(ref.current).toHaveClass('mine');
    expect(ref.current).toHaveAttribute('data-x', '1');
  });
  it('has no axe violations', async () => {
    const {container} = render(<Breadcrumb items={items} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
