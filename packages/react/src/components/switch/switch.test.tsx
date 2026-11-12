import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {axe} from '../../test/axe';
import {Switch} from './switch';

describe('Switch', () => {
  it('toggles by click and keyboard', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Switch label="Digest" onCheckedChange={onChange} />);
    const sw = screen.getByRole('switch', {name: 'Digest'});
    await user.click(sw);
    expect(sw).toBeChecked();
    sw.focus();
    await user.keyboard('{Enter}');
    expect(sw).not.toBeChecked();
    expect(onChange).toHaveBeenCalledTimes(2);
  });
  it('is inert when disabled', async () => {
    const user = userEvent.setup();
    render(<Switch label="Off" disabled />);
    await user.click(screen.getByRole('switch'));
    expect(screen.getByRole('switch')).not.toBeChecked();
  });
  it('has no axe violations', async () => {
    const {container} = render(<Switch label="Digest" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
