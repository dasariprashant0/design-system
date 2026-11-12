import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {axe} from '../../test/axe';
import {Checkbox} from './checkbox';

describe('Checkbox', () => {
  it('toggles with click and Space, and reports the value', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Checkbox label="Replies" onCheckedChange={onChange} />);
    const box = screen.getByRole('checkbox', {name: 'Replies'});
    await user.click(box);
    expect(box).toBeChecked();
    box.focus();
    await user.keyboard(' ');
    expect(box).not.toBeChecked();
    expect(onChange).toHaveBeenNthCalledWith(1, true);
    expect(onChange).toHaveBeenNthCalledWith(2, false);
  });
  it('clicking the label toggles it', async () => {
    const user = userEvent.setup();
    render(<Checkbox label="Replies" />);
    await user.click(screen.getByText('Replies'));
    expect(screen.getByRole('checkbox')).toBeChecked();
  });
  it('supports indeterminate', () => {
    render(<Checkbox label="All" checked="indeterminate" onCheckedChange={() => {}} />);
    expect(screen.getByRole('checkbox')).toHaveAttribute('aria-checked', 'mixed');
  });
  it('does not toggle when disabled', async () => {
    const user = userEvent.setup();
    render(<Checkbox label="No" disabled />);
    await user.click(screen.getByRole('checkbox'));
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });
  it('has no axe violations', async () => {
    const {container} = render(<Checkbox label="Replies" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
