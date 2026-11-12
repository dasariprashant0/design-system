import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {axe} from '../../test/axe';
import {Toggle} from './toggle';

describe('Toggle', () => {
  it('toggles aria-pressed and reports it', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Toggle onPressedChange={onChange}>Bold</Toggle>);
    const t = screen.getByRole('button', {name: 'Bold'});
    expect(t).toHaveAttribute('aria-pressed', 'false');
    await user.click(t);
    expect(t).toHaveAttribute('aria-pressed', 'true');
    expect(onChange).toHaveBeenCalledWith(true);
  });
  it('has no axe violations', async () => {
    const {container} = render(<Toggle>Bold</Toggle>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
