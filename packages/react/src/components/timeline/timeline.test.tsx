import {render, screen} from '@testing-library/react';
import {axe} from '../../test/axe';
import {Timeline, TimelineItem} from './timeline';
import {createRef} from 'react';

const ui = () => (
  <Timeline aria-label="History">
    <TimelineItem title="Created" time="Mon" dateTime="2026-01-05">First draft</TimelineItem>
    <TimelineItem title="Published" time="Tue" />
  </Timeline>
);

describe('Timeline', () => {
  it('is a list of events', () => {
    render(ui());
    expect(screen.getByRole('list', {name: 'History'})).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });
  it('uses a time element with the machine date', () => {
    render(ui());
    expect(screen.getByText('Mon')).toHaveAttribute('datetime', '2026-01-05');
  });
  it('shows body content only when given', () => {
    render(ui());
    expect(screen.getByText('First draft')).toBeInTheDocument();
  });
  it('renders the title, time and body in that order inside each item', () => {
    render(ui());
    const first = screen.getAllByRole('listitem')[0]!;
    expect([...first.children].map((c) => c.className)).toEqual(['timeline-title', 'timeline-time', 'timeline-body']);
  });
  it('omits time and body when not given', () => {
    render(<Timeline><TimelineItem title="Only" /></Timeline>);
    const li = screen.getByRole('listitem');
    expect(li.querySelector('time')).toBeNull();
    expect(li.querySelector('.timeline-body')).toBeNull();
  });
  it('a time without dateTime has no datetime attribute', () => {
    render(<Timeline><TimelineItem title="t" time="Yesterday" /></Timeline>);
    expect(screen.getByText('Yesterday').tagName).toBe('TIME');
    expect(screen.getByText('Yesterday')).not.toHaveAttribute('datetime');
  });
  it('keeps items in source order', () => {
    render(ui());
    expect(screen.getAllByRole('listitem').map((li) => li.querySelector('.timeline-title')!.textContent)).toEqual(['Created', 'Published']);
  });
  it('is an ol and an li with merged classes, refs and spread props', () => {
    const ol = createRef<HTMLOListElement>();
    const li = createRef<HTMLLIElement>();
    render(<Timeline ref={ol} className="a"><TimelineItem ref={li} title="t" className="b" data-x="1" /></Timeline>);
    expect(ol.current!.tagName).toBe('OL');
    expect(ol.current).toHaveClass('timeline', 'a');
    expect(li.current).toHaveClass('timeline-item', 'b');
    expect(li.current).toHaveAttribute('data-x', '1');
  });
  it('renders an empty timeline, rich titles, long and RTL text', () => {
    const {rerender} = render(<Timeline aria-label="e" />);
    expect(screen.getByRole('list')).toBeEmptyDOMElement();
    rerender(<Timeline><TimelineItem title={<b>أُنشئ</b>} time={'x'.repeat(500)}>{'نص '.repeat(200)}</TimelineItem></Timeline>);
    expect(screen.getByText('أُنشئ').tagName).toBe('B');
  });
  it('has no axe violations', async () => {
    const {container} = render(ui());
    expect(await axe(container)).toHaveNoViolations();
  });
});
