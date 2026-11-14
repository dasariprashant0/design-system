import {render, screen} from '@testing-library/react';
import {axe} from '../../test/axe';
import {PageHeader} from './page-header';
import {Breadcrumb} from '../breadcrumb';

describe('PageHeader', () => {
  it('renders the title as an h1 with description, breadcrumbs and actions', () => {
    render(<PageHeader title="Customers" description="Everyone." breadcrumbs={<Breadcrumb items={[{label: 'Home', href: '/'}, {label: 'Customers'}]} />} actions={<button>Add</button>} />);
    expect(screen.getByRole('heading', {level: 1, name: 'Customers'})).toBeInTheDocument();
    expect(screen.getByText('Everyone.')).toBeInTheDocument();
    expect(screen.getByRole('navigation', {name: 'Breadcrumb'})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Add'})).toBeInTheDocument();
  });
  it('uses another heading level and omits empty parts', () => {
    const {container} = render(<PageHeader title="Billing" level={2} />);
    expect(screen.getByRole('heading', {level: 2, name: 'Billing'})).toBeInTheDocument();
    expect(container.querySelector('.page-header-actions')).toBeNull();
    expect(container.querySelector('.page-header-description')).toBeNull();
  });
  it('forwards the ref and className', () => {
    const ref = {current: null as HTMLDivElement | null};
    render(<PageHeader ref={ref} title="T" className="x" />);
    expect(ref.current).toHaveClass('page-header', 'x');
  });
  it('has no axe violations', async () => {
    const {container} = render(<PageHeader title="Customers" description="Everyone." actions={<button>Add</button>} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
