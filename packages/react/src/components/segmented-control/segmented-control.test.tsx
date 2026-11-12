import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {axe} from '../../test/axe';
import {SegmentedControl} from './segmented-control';

const options = [{value: 'day', label: 'Day'}, {value: 'week', label: 'Week'}, {value: 'month', label: 'Month'}];

describe('SegmentedControl', () => {
  it('selects the first option by default and exposes radios', () => {
    render(<SegmentedControl aria-label="Range" options={options} />);
    expect(screen.getByRole('radiogroup', {name: 'Range'})).toBeInTheDocument();
    expect(screen.getByRole('radio', {name: 'Day'})).toBeChecked();
  });
  it('changes on click and reports it', async () => {
    const user = userEvent.setup();
    const fn = vi.fn();
    render(<SegmentedControl aria-label="Range" options={options} onValueChange={fn} />);
    await user.click(screen.getByRole('radio', {name: 'Week'}));
    expect(fn).toHaveBeenCalledWith('week');
    expect(screen.getByRole('radio', {name: 'Week'})).toBeChecked();
  });
  it('cannot be emptied by pressing the active option', async () => {
    const user = userEvent.setup();
    render(<SegmentedControl aria-label="Range" options={options} defaultValue="week" />);
    await user.click(screen.getByRole('radio', {name: 'Week'}));
    expect(screen.getByRole('radio', {name: 'Week'})).toBeChecked();
  });
  it('moves with arrow keys', async () => {
    const user = userEvent.setup();
    render(<SegmentedControl aria-label="Range" options={options} />);
    await user.tab();
    await user.keyboard('{ArrowRight}{Enter}');
    expect(screen.getByRole('radio', {name: 'Week'})).toBeChecked();
  });
  it('has no axe violations', async () => {
    const {container} = render(<SegmentedControl aria-label="Range" options={options} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
