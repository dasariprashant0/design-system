import {render, screen} from '@testing-library/react';
import {axe} from '../../test/axe';
import {Breadcrumb} from './breadcrumb';

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
  it('has no axe violations', async () => {
    const {container} = render(<Breadcrumb items={items} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
