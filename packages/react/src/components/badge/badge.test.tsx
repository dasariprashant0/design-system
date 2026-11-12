import {render, screen} from '@testing-library/react';
import {axe} from '../../test/axe';
import {Badge} from './badge';

describe('Badge', () => {
  it('renders text with variant classes', () => {
    render(<><Badge>draft</Badge><Badge variant="solid">12</Badge><Badge variant="accent">new</Badge></>);
    expect(screen.getByText('draft')).toHaveClass('badge');
    expect(screen.getByText('12')).toHaveClass('badge-solid');
    expect(screen.getByText('new')).toHaveClass('badge-accent');
  });
  it('has no axe violations', async () => {
    const {container} = render(<Badge>draft</Badge>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
