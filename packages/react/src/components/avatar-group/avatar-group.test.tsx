import {render, screen} from '@testing-library/react';
import {axe} from '../../test/axe';
import {Avatar} from '../avatar';
import {AvatarGroup} from './avatar-group';
import {createRef} from 'react';

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
  it('defaults to showing four avatars then +N', () => {
    render(ui());
    expect(screen.getByText('+1')).toBeInTheDocument();
    expect(screen.getAllByRole('img')).toHaveLength(4);
  });
  it('shows no count when everything fits, including exactly max', () => {
    render(ui(5));
    expect(screen.queryByText(/^\+/)).not.toBeInTheDocument();
    expect(screen.getAllByRole('img')).toHaveLength(5);
  });
  it('keeps the first avatars in order and drops the tail', () => {
    render(ui(2));
    expect(screen.getAllByRole('img').map((i) => i.textContent)).toEqual(['AL', 'GH']);
    expect(screen.getByText('+3')).toBeInTheDocument();
  });
  it('max=0 collapses everything into the count', () => {
    render(ui(0));
    expect(screen.queryAllByRole('img')).toHaveLength(0);
    expect(screen.getByText('+5')).toBeInTheDocument();
  });
  it('renders an empty group and ignores null/false children', () => {
    render(<AvatarGroup aria-label="Empty">{null}{false}</AvatarGroup>);
    const g = screen.getByRole('group', {name: 'Empty'});
    expect(g).toBeEmptyDOMElement();
  });
  it('forwards ref and merges className', () => {
    const ref = createRef<HTMLDivElement>();
    render(<AvatarGroup ref={ref} aria-label="m" className="x" />);
    expect(ref.current).toHaveClass('avatar-group', 'x');
  });
  it('lets the overflow chip use the avatar look', () => {
    render(ui(1));
    expect(screen.getByText('+4')).toHaveClass('avatar', 'avatar-line');
  });
  it('has no axe violations', async () => {
    const {container} = render(ui(3));
    expect(await axe(container)).toHaveNoViolations();
  });
});
