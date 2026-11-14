import {render, screen, within} from '@testing-library/react';
import {axe} from '../../test/axe';
import {BreadcrumbsAuto} from './breadcrumbs-auto';

describe('BreadcrumbsAuto', () => {
  it('builds Home and one crumb per segment; the last is the current page', () => {
    render(<BreadcrumbsAuto pathname="/settings/billing-plans?tab=1#x" />);
    const nav = screen.getByRole('navigation', {name: 'Breadcrumb'});
    expect(within(nav).getByRole('link', {name: 'Home'})).toHaveAttribute('href', '/');
    expect(within(nav).getByRole('link', {name: 'Settings'})).toHaveAttribute('href', '/settings');
    expect(within(nav).queryByRole('link', {name: 'Billing plans'})).toBeNull();
    expect(within(nav).getByText('Billing plans')).toHaveAttribute('aria-current', 'page');
  });
  it('uses labels and homeLabel; the root path is just Home', () => {
    const {rerender} = render(<BreadcrumbsAuto pathname="/api/keys" labels={{api: 'API'}} homeLabel="Start" />);
    expect(screen.getByRole('link', {name: 'Start'})).toBeInTheDocument();
    expect(screen.getByRole('link', {name: 'API'})).toHaveAttribute('href', '/api');
    rerender(<BreadcrumbsAuto pathname="/" />);
    expect(screen.queryByRole('link')).toBeNull();
    expect(screen.getByText('Home')).toHaveAttribute('aria-current', 'page');
  });
  it('forwards the ref', () => {
    const ref = {current: null as HTMLElement | null};
    render(<BreadcrumbsAuto ref={ref} pathname="/a" />);
    expect(ref.current?.tagName).toBe('NAV');
  });
  it('has no axe violations', async () => {
    const {container} = render(<BreadcrumbsAuto pathname="/a/b" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
