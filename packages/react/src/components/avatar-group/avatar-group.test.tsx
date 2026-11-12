import {render, screen} from '@testing-library/react';
import {axe} from '../../test/axe';
import {Avatar} from '../avatar';
import {AvatarGroup} from './avatar-group';

const people = ['Ada Lovelace', 'Grace Hopper', 'Alan Turing', 'Linus Torvalds', 'Margaret Hamilton'];
const ui = (max?: number) => <AvatarGroup aria-label="Members" max={max}>{people.map((n) => <Avatar key={n} name={n} />)}</AvatarGroup>;

describe('AvatarGroup', () => {
  it('is a named group', () => {
    render(ui(10));
    expect(screen.getByRole('group', {name: 'Members'})).toBeInTheDocument();
  });
  it('collapses extras into a count', () => {
    render(ui(3));
    expect(screen.getByText('+2')).toBeInTheDocument();
    expect(screen.queryByText('LT')).not.toBeInTheDocument();
  });
  it('has no axe violations', async () => {
    const {container} = render(ui(3));
    expect(await axe(container)).toHaveNoViolations();
  });
});
