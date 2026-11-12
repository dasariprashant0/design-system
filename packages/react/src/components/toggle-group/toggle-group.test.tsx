import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {axe} from '../../test/axe';
import {ToggleGroup, ToggleGroupItem} from './toggle-group';

const ui = (onValueChange?: (v: string) => void) => (
  <ToggleGroup type="single" defaultValue="30" aria-label="Range" onValueChange={onValueChange}>
    <ToggleGroupItem value="7">7 days</ToggleGroupItem>
    <ToggleGroupItem value="30">30 days</ToggleGroupItem>
  </ToggleGroup>
);

describe('ToggleGroup', () => {
  it('selects one item at a time', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(ui(onChange));
    expect(screen.getByRole('radio', {name: '30 days'})).toBeChecked();
    await user.click(screen.getByRole('radio', {name: '7 days'}));
    expect(onChange).toHaveBeenCalledWith('7');
    expect(screen.getByRole('radio', {name: '30 days'})).not.toBeChecked();
  });
  it('moves focus with arrow keys', async () => {
    const user = userEvent.setup();
    render(ui());
    await user.tab();
    await user.keyboard('{ArrowLeft}');
    expect(screen.getByRole('radio', {name: '7 days'})).toHaveFocus();
  });
  it('has no axe violations', async () => {
    const {container} = render(ui());
    expect(await axe(container)).toHaveNoViolations();
  });
});
