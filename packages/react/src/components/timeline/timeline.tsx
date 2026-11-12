import {forwardRef, type HTMLAttributes, type ReactNode} from 'react';
import {cx} from '../../utils/cx';

export type TimelineProps = HTMLAttributes<HTMLOListElement>;

/** A vertical, ordered list of events. Put `TimelineItem`s inside, newest or oldest first as you prefer. */
export const Timeline = forwardRef<HTMLOListElement, TimelineProps>(function Timeline({className, ...rest}, ref) {
  return <ol ref={ref} className={cx('timeline', className)} {...rest} />;
});

export interface TimelineItemProps extends Omit<HTMLAttributes<HTMLLIElement>, 'title'> {
  /** What happened, shown as the entry's heading line. */
  title: ReactNode;
  /** Human text for when it happened, such as "2 days ago". */
  time?: ReactNode;
  /** Machine-readable date for the time element. */
  dateTime?: string;
}

/** One event: a `title`, optional `time` and optional body text as children. */
export const TimelineItem = forwardRef<HTMLLIElement, TimelineItemProps>(function TimelineItem({title, time, dateTime, className, children, ...rest}, ref) {
  return (
    <li ref={ref} className={cx('timeline-item', className)} {...rest}>
      <div className="timeline-title">{title}</div>
      {time && <time className="timeline-time" dateTime={dateTime}>{time}</time>}
      {children && <div className="timeline-body">{children}</div>}
    </li>
  );
});
