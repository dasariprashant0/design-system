import {render, screen} from '@testing-library/react';
import {axe} from '../../test/axe';
import {Button} from '../button';
import {EmptyState} from './empty-state';
import {createRef} from 'react';

describe('EmptyState', () => {
  it('shows the title, description and action', () => {
    render(<EmptyState title="No projects" description="Create one to start."><Button>Create project</Button></EmptyState>);
    expect(screen.getByRole('heading', {name: 'No projects'})).toBeInTheDocument();
    expect(screen.getByText('Create one to start.')).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Create project'})).toBeInTheDocument();
  });
  it('omits optional parts', () => {
    const {container} = render(<EmptyState title="Nothing" />);
    expect(container.querySelector('.empty-description')).toBeNull();
    expect(container.querySelector('.empty-actions')).toBeNull();
  });
  it('renders the title as an h3 and the description as a paragraph', () => {
    render(<EmptyState title="Nothing" description="Try again." />);
    expect(screen.getByRole('heading', {level: 3, name: 'Nothing'})).toHaveClass('empty-title');
    expect(screen.getByText('Try again.').tagName).toBe('P');
  });
  it('hides the icon from assistive tech', () => {
    const {container} = render(<EmptyState title="T" icon={<svg data-testid="i" />} />);
    expect(container.querySelector('.empty-icon')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByTestId('i')).toBeInTheDocument();
  });
  it('puts children in the actions slot, and several are all kept', () => {
    render(<EmptyState title="T"><Button>One</Button><Button>Two</Button></EmptyState>);
    const slot = screen.getByRole('button', {name: 'One'}).parentElement!;
    expect(slot).toHaveClass('empty-actions');
    expect(slot.querySelectorAll('button')).toHaveLength(2);
  });
  it('forwards ref, merges className and spreads props', () => {
    const ref = createRef<HTMLDivElement>();
    render(<EmptyState ref={ref} title="T" className="mine" data-x="1" />);
    expect(ref.current).toHaveClass('empty', 'mine');
    expect(ref.current).toHaveAttribute('data-x', '1');
  });
  it('accepts rich titles, long text and RTL', () => {
    render(<EmptyState title={<span>لا شيء</span>} description={'z'.repeat(3000)} />);
    expect(screen.getByRole('heading')).toHaveTextContent('لا شيء');
    expect(screen.getByText('z'.repeat(3000))).toBeInTheDocument();
  });
  it('has no axe violations', async () => {
    const {container} = render(<EmptyState title="No projects" description="Create one." />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
