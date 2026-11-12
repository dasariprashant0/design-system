import {render, screen} from '@testing-library/react';
import {axe} from '../../test/axe';
import {Timeline, TimelineItem} from './timeline';

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
  it('has no axe violations', async () => {
    const {container} = render(ui());
    expect(await axe(container)).toHaveNoViolations();
  });
});
