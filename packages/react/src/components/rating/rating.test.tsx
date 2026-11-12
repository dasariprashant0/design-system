import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {axe} from '../../test/axe';
import {Rating} from './rating';

describe('Rating', () => {
  it('is a radio group of max stars', () => {
    render(<Rating aria-label="Rate" max={4} />);
    expect(screen.getByRole('radiogroup', {name: 'Rate'})).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(4);
  });
  it('selects on click and reports the value', async () => {
    const user = userEvent.setup();
    const fn = vi.fn();
    render(<Rating aria-label="Rate" onValueChange={fn} />);
    await user.click(screen.getByRole('radio', {name: '3 of 5'}));
    expect(fn).toHaveBeenCalledWith(3);
    expect(screen.getByRole('radio', {name: '3 of 5'})).toBeChecked();
  });
  it('changes with arrow keys', async () => {
    const user = userEvent.setup();
    render(<Rating aria-label="Rate" defaultValue={2} />);
    screen.getByRole('radio', {name: '2 of 5'}).focus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('radio', {name: '3 of 5'})).toBeChecked();
  });
  it('read-only shows a text alternative and no controls', () => {
    render(<Rating aria-label="Average" value={4} readOnly />);
    expect(screen.getByRole('img', {name: 'Average: 4 out of 5'})).toBeInTheDocument();
    expect(screen.queryByRole('radio')).not.toBeInTheDocument();
  });
  it('has no axe violations', async () => {
    const {container} = render(<Rating aria-label="Rate" defaultValue={2} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
