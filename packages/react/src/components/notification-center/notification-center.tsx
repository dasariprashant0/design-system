'use client';
import {forwardRef, type HTMLAttributes} from 'react';
import {Button} from '../button';
import {IconButton} from '../icon-button';
import {Popover, PopoverContent, PopoverTrigger} from '../popover';
import {cx} from '../../utils/cx';

export interface NotificationItem {
  /** Unique key; passed back to `onMarkRead`. */
  id: string;
  /** One line saying what happened. */
  title: string;
  /** Optional detail under the title. */
  description?: string;
  /** Optional time text such as "2 min ago". Format it yourself so it matches your locale. */
  time?: string;
  /** True once the user has seen it. Unread items are bold, marked "Unread" for screen readers and counted in the badge. */
  read?: boolean;
}

export interface NotificationCenterProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** The notifications, newest first. You own this list: update it in the callbacks below. */
  notifications: NotificationItem[];
  /** Called with the id when the user marks one notification as read. Hides that item's "Mark read" button once `read` is true. */
  onMarkRead?: (id: string) => void;
  /** Called when the user chooses "Mark all read". The button is disabled when nothing is unread. */
  onMarkAllRead?: () => void;
  /** Called when the user chooses "Clear all". The button is disabled when the list is empty. */
  onClear?: () => void;
  /** Name of the bell button and the panel. Default "Notifications". */
  label?: string;
  /** Shown when there are no notifications. Default "You're all caught up." */
  emptyText?: string;
}

const Bell = () => <svg aria-hidden="true" viewBox="0 0 16 16" width="1em" height="1em" fill="none" stroke="currentColor"><path d="M3.5 12.5h9l-1.2-1.8V7a3.3 3.3 0 0 0-6.6 0v3.7zM6.5 12.5a1.5 1.5 0 0 0 3 0" /></svg>;

/**
 * A bell button with an unread count badge that opens a panel listing notifications, with mark-read and clear actions.
 * The button's name includes the count ("Notifications, 3 unread"); the badge itself is hidden from assistive tech so the count is read once.
 * @example <NotificationCenter notifications={list} onMarkRead={markRead} onMarkAllRead={markAll} onClear={clear} />
 */
export const NotificationCenter = forwardRef<HTMLSpanElement, NotificationCenterProps>(function NotificationCenter({notifications, onMarkRead, onMarkAllRead, onClear, label = 'Notifications', emptyText = "You're all caught up.", className, ...rest}, ref) {
  const unread = notifications.filter((n) => !n.read).length;
  return (
    <span ref={ref} className={cx('notification-center', className)} {...rest}>
      <Popover>
        <PopoverTrigger asChild>
          <IconButton aria-label={unread ? `${label}, ${unread} unread` : label}><Bell /></IconButton>
        </PopoverTrigger>
        {unread > 0 && <span className="badge badge-accent notification-center-badge" aria-hidden="true">{unread > 99 ? '99+' : unread}</span>}
        <PopoverContent className="notification-center-panel" aria-label={label} align="end">
          <div className="notification-center-head">
            <strong>{label}</strong>
            <span className="notification-center-actions">
              <Button variant="ghost" size="sm" disabled={!unread} onClick={onMarkAllRead}>Mark all read</Button>
              <Button variant="ghost" size="sm" disabled={!notifications.length} onClick={onClear}>Clear all</Button>
            </span>
          </div>
          {notifications.length === 0 ? <p className="notification-center-empty">{emptyText}</p> : (
            <ul className="notification-center-list">
              {notifications.map((n) => (
                <li key={n.id} className="notification-center-item" data-unread={!n.read || undefined}>
                  <div className="notification-center-text">
                    <span className="notification-center-title">{!n.read && <span className="sr-only">Unread: </span>}{n.title}</span>
                    {n.description && <span className="notification-center-desc">{n.description}</span>}
                    {n.time && <span className="notification-center-time">{n.time}</span>}
                  </div>
                  {!n.read && <Button variant="ghost" size="sm" aria-label={`Mark "${n.title}" as read`} onClick={() => onMarkRead?.(n.id)}>Mark read</Button>}
                </li>
              ))}
            </ul>
          )}
        </PopoverContent>
      </Popover>
    </span>
  );
});
