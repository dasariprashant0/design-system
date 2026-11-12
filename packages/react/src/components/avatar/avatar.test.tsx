import {render, screen} from '@testing-library/react';
import {axe} from '../../test/axe';
import {Avatar} from './avatar';

describe('Avatar', () => {
  it('shows initials as a named image when there is no src', () => {
    render(<Avatar name="Ada Lovelace" />);
    const el = screen.getByRole('img', {name: 'Ada Lovelace'});
    expect(el).toHaveTextContent('AL');
  });
  it('applies size and variant classes', () => {
    const {container} = render(<Avatar name="Alan Turing" size="lg" variant="line" />);
    expect(container.firstChild).toHaveClass('avatar', 'avatar-lg', 'avatar-line');
  });
  it('has no axe violations', async () => {
    const {container} = render(<Avatar name="Ada Lovelace" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
