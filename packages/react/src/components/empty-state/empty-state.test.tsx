import {render, screen} from '@testing-library/react';
import {axe} from '../../test/axe';
import {Button} from '../button';
import {EmptyState} from './empty-state';

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
  it('has no axe violations', async () => {
    const {container} = render(<EmptyState title="No projects" description="Create one." />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
