import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {axe} from '../../test/axe';
import {Field} from '../field';
import {Autocomplete} from './autocomplete';

const suggestions = ['Berlin', 'Bangalore', 'Boston', 'Lisbon'];

describe('Autocomplete', () => {
  it('is a closed combobox until you type', async () => {
    const user = userEvent.setup();
    render(<Autocomplete aria-label="City" suggestions={suggestions} />);
    const input = screen.getByRole('combobox', {name: 'City'});
    expect(input).toHaveAttribute('aria-expanded', 'false');
    await user.click(input);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    await user.type(input, 'b');
    expect(screen.getAllByRole('option')).toHaveLength(4);
    await user.type(input, 'os');
    expect(screen.getAllByRole('option')).toHaveLength(1);
  });
  it('keeps free text on Enter when no option is active', async () => {
    const user = userEvent.setup();
    const fn = vi.fn();
    render(<Autocomplete aria-label="City" suggestions={suggestions} onValueChange={fn} />);
    await user.type(screen.getByRole('combobox'), 'Bo{Enter}');
    expect(screen.getByRole('combobox')).toHaveValue('Bo');
    expect(fn).toHaveBeenLastCalledWith('Bo');
  });
  it('accepts text that is not in the list', async () => {
    const user = userEvent.setup();
    render(<Autocomplete aria-label="City" suggestions={suggestions} />);
    await user.type(screen.getByRole('combobox'), 'Zurich');
    expect(screen.getByRole('combobox')).toHaveValue('Zurich');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
  it('picks a suggestion with the keyboard and tracks aria-activedescendant', async () => {
    const user = userEvent.setup();
    const fn = vi.fn();
    render(<Autocomplete aria-label="City" suggestions={suggestions} onValueChange={fn} />);
    await user.type(screen.getByRole('combobox'), 'b');
    await user.keyboard('{ArrowDown}{ArrowDown}');
    const id = screen.getByRole('combobox').getAttribute('aria-activedescendant');
    expect(document.getElementById(id!)).toHaveTextContent('Bangalore');
    await user.keyboard('{Enter}');
    expect(fn).toHaveBeenLastCalledWith('Bangalore');
    expect(screen.getByRole('combobox')).toHaveValue('Bangalore');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
  it('picks with the mouse and closes with Escape', async () => {
    const user = userEvent.setup();
    render(<Autocomplete aria-label="City" suggestions={suggestions} />);
    await user.type(screen.getByRole('combobox'), 'l');
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    await user.type(screen.getByRole('combobox'), 'i');
    await user.click(screen.getByRole('option', {name: 'Lisbon'}));
    expect(screen.getByRole('combobox')).toHaveValue('Lisbon');
  });
  it('works controlled and forwards the ref', () => {
    const ref = {current: null as HTMLInputElement | null};
    render(<Autocomplete aria-label="City" ref={ref} suggestions={suggestions} value="Rome" />);
    expect(ref.current).toBe(screen.getByRole('combobox'));
    expect(screen.getByRole('combobox')).toHaveValue('Rome');
  });
  it('has no axe violations', async () => {
    const user = userEvent.setup();
    const {container} = render(<Field label="City"><Autocomplete suggestions={suggestions} /></Field>);
    await user.type(screen.getByRole('combobox', {name: 'City'}), 'b');
    expect(await axe(container)).toHaveNoViolations();
  });
});
