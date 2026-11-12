import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {axe} from '../../test/axe';
import {RadioGroup, RadioGroupItem} from './radio-group';

const ui = (onValueChange?: (v: string) => void) => (
  <RadioGroup aria-label="Plan" defaultValue="monthly" onValueChange={onValueChange}>
    <RadioGroupItem value="monthly" label="Monthly" />
    <RadioGroupItem value="yearly" label="Yearly" />
  </RadioGroup>
);

describe('RadioGroup', () => {
  it('selects with click and reports the value', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(ui(onChange));
    await user.click(screen.getByRole('radio', {name: 'Yearly'}));
    expect(screen.getByRole('radio', {name: 'Yearly'})).toBeChecked();
    expect(onChange).toHaveBeenCalledWith('yearly');
  });
  it('moves focus with arrow keys and selects with Space', async () => {
    const user = userEvent.setup();
    render(ui());
    await user.tab();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('radio', {name: 'Yearly'})).toHaveFocus();
    await user.keyboard(' ');
    expect(screen.getByRole('radio', {name: 'Yearly'})).toBeChecked();
  });
  it('has no axe violations', async () => {
    const {container} = render(ui());
    expect(await axe(container)).toHaveNoViolations();
  });
});
