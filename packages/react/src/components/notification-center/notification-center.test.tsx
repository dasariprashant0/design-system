import {render, screen, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {axe} from '../../test/axe';
import {NotificationCenter, type NotificationItem} from './notification-center';

const list: NotificationItem[] = [
  {id: 'a', title: 'Deploy finished', description: 'Production', time: '2 min ago'},
  {id: 'b', title: 'New comment'},
  {id: 'c', title: 'Invoice paid', read: true},
];

describe('NotificationCenter', () => {
  it('names the bell with the unread count and hides the badge from assistive tech', () => {
    const {container} = render(<NotificationCenter notifications={list} />);
    expect(screen.getByRole('button', {name: 'Notifications, 2 unread'})).toBeInTheDocument();
    expect(container.querySelector('.notification-center-badge')).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelector('.notification-center-badge')).toHaveTextContent('2');
  });
  it('has a plain name and no badge when everything is read', () => {
    const {container} = render(<NotificationCenter notifications={[{id: 'c', title: 'x', read: true}]} />);
    expect(screen.getByRole('button', {name: 'Notifications'})).toBeInTheDocument();
    expect(container.querySelector('.notification-center-badge')).toBeNull();
  });
  it('caps the badge at 99+', () => {
    const many = Array.from({length: 120}, (_, i) => ({id: String(i), title: `n${i}`}));
    const {container} = render(<NotificationCenter notifications={many} />);
    expect(container.querySelector('.notification-center-badge')).toHaveTextContent('99+');
  });
  it('opens a labelled panel listing notifications, marking unread ones for screen readers', async () => {
    const user = userEvent.setup();
    render(<NotificationCenter notifications={list} />);
    await user.click(screen.getByRole('button', {name: /Notifications/}));
    const panel = await screen.findByRole('dialog', {name: 'Notifications'});
    expect(within(panel).getAllByRole('listitem')).toHaveLength(3);
    expect(within(panel).getAllByText('Unread:', {exact: false})).toHaveLength(2);
  });
  it('marks one read and marks all read', async () => {
    const user = userEvent.setup();
    const onMarkRead = vi.fn(), onMarkAllRead = vi.fn();
    render(<NotificationCenter notifications={list} onMarkRead={onMarkRead} onMarkAllRead={onMarkAllRead} />);
    await user.click(screen.getByRole('button', {name: /Notifications/}));
    await user.click(await screen.findByRole('button', {name: 'Mark "New comment" as read'}));
    expect(onMarkRead).toHaveBeenCalledWith('b');
    await user.click(screen.getByRole('button', {name: 'Mark all read'}));
    expect(onMarkAllRead).toHaveBeenCalled();
    expect(screen.queryByRole('button', {name: /Invoice paid/})).toBeNull(); // read items have no button
  });
  it('clears and shows the empty state', async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();
    const {rerender} = render(<NotificationCenter notifications={list} onClear={onClear} />);
    await user.click(screen.getByRole('button', {name: /Notifications/}));
    await user.click(await screen.findByRole('button', {name: 'Clear all'}));
    expect(onClear).toHaveBeenCalled();
    rerender(<NotificationCenter notifications={[]} onClear={onClear} />);
    expect(screen.getByText("You're all caught up.")).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Clear all'})).toBeDisabled();
    expect(screen.getByRole('button', {name: 'Mark all read'})).toBeDisabled();
  });
  it('closes with Escape and returns focus to the bell', async () => {
    const user = userEvent.setup();
    render(<NotificationCenter notifications={list} />);
    const bell = screen.getByRole('button', {name: /Notifications/});
    await user.click(bell);
    await screen.findByRole('dialog');
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(bell).toHaveFocus();
  });
  it('has no axe violations closed and open', async () => {
    const user = userEvent.setup();
    const {container} = render(<NotificationCenter notifications={list} />);
    expect(await axe(container)).toHaveNoViolations();
    await user.click(screen.getByRole('button', {name: /Notifications/}));
    await screen.findByRole('dialog');
    expect(await axe(document.body)).toHaveNoViolations();
  });
});
