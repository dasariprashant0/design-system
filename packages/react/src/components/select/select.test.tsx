import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {axe} from '../../test/axe';
import {Field} from '../field';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from './select';

const ui = (onValueChange?: (v: string) => void) => (
  <Field label="Interval">
    <Select onValueChange={onValueChange}>
      <SelectTrigger><SelectValue placeholder="Choose" /></SelectTrigger>
      <SelectContent><SelectItem value="5">5 minutes</SelectItem><SelectItem value="15">15 minutes</SelectItem></SelectContent>
    </Select>
  </Field>
);

describe('Select', () => {
  it('is labelled by its Field', () => {
    render(ui());
    expect(screen.getByRole('combobox', {name: 'Interval'})).toBeInTheDocument();
  });
  it('opens, lists options and selects one', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(ui(onChange));
    await user.click(screen.getByRole('combobox'));
    await user.click(await screen.findByRole('option', {name: '15 minutes'}));
    expect(onChange).toHaveBeenCalledWith('15');
    expect(screen.getByRole('combobox')).toHaveTextContent('15 minutes');
  });
  it('selects with the keyboard', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(ui(onChange));
    screen.getByRole('combobox').focus();
    await user.keyboard('{Enter}');
    await screen.findByRole('listbox');
    await user.keyboard('{ArrowDown}{Enter}');
    expect(onChange).toHaveBeenCalled();
  });
  it('has no axe violations closed', async () => {
    const {container} = render(ui());
    expect(await axe(container)).toHaveNoViolations();
  });
});
