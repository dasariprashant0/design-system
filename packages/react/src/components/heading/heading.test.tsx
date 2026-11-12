import {render, screen} from '@testing-library/react';
import {axe} from '../../test/axe';
import {Heading} from './heading';

describe('Heading', () => {
  it('renders the requested level', () => {
    render(<Heading level={3}>Plans</Heading>);
    expect(screen.getByRole('heading', {level: 3, name: 'Plans'})).toBeInTheDocument();
  });
  it('separates level from size', () => {
    render(<Heading level={2} size="sm">Small h2</Heading>);
    const h = screen.getByRole('heading', {level: 2});
    expect(h).toHaveClass('heading-sm');
  });
  it('picks a default size from the level', () => {
    render(<Heading level={1}>Title</Heading>);
    expect(screen.getByRole('heading', {level: 1})).toHaveClass('heading-display');
  });
  it('has no axe violations', async () => {
    const {container} = render(<Heading level={1}>Title</Heading>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
