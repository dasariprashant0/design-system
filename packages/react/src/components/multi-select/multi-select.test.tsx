import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {axe} from '../../test/axe';
import {Field} from '../field';
import {MultiSelect} from './multi-select';

const options = [{value: 'ada', label: 'Ada Lovelace'}, {value: 'grace', label: 'Grace Hopper'}, {value: 'alan', label: 'Alan Turing', disabled: true}];

describe('MultiSelect', () => {
  it('has the combobox role and a multiselectable listbox', async () => {
    const user = userEvent.setup();
    render(<MultiSelect aria-label="People" options={options} />);
    expect(screen.getByRole('combobox', {name: 'People'})).toHaveAttribute('aria-expanded', 'false');
    await user.click(screen.getByRole('combobox'));
    expect(screen.getByRole('listbox')).toHaveAttribute('aria-multiselectable', 'true');
  });
  it('picks several with the keyboard and keeps the list open', async () => {
    const user = userEvent.setup();
    const fn = vi.fn();
    render(<MultiSelect aria-label="People" options={options} onValueChange={fn} />);
    await user.click(screen.getByRole('combobox'));
    await user.keyboard('{Enter}{ArrowDown}{Enter}');
    expect(fn).toHaveBeenLastCalledWith(['ada', 'grace']);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getByRole('option', {name: 'Ada Lovelace'})).toHaveAttribute('aria-selected', 'true');
  });
  it('toggles an option off and filters as you type', async () => {
    const user = userEvent.setup();
    render(<MultiSelect aria-label="People" options={options} defaultValue={['ada']} />);
    await user.type(screen.getByRole('combobox'), 'gra');
    expect(screen.getAllByRole('option')).toHaveLength(1);
    await user.clear(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', {name: 'Ada Lovelace'}));
    expect(screen.queryByRole('button', {name: 'Remove Ada Lovelace'})).not.toBeInTheDocument();
  });
  it('removes tags with the button and with Backspace', async () => {
    const user = userEvent.setup();
    render(<MultiSelect aria-label="People" options={options} defaultValue={['ada', 'grace']} />);
    await user.click(screen.getByRole('button', {name: 'Remove Ada Lovelace'}));
    expect(screen.queryByRole('button', {name: 'Remove Ada Lovelace'})).not.toBeInTheDocument();
    await user.click(screen.getByRole('combobox'));
    await user.keyboard('{Backspace}');
    expect(screen.queryByRole('button', {name: 'Remove Grace Hopper'})).not.toBeInTheDocument();
  });
  it('skips disabled options and closes with Escape', async () => {
    const user = userEvent.setup();
    const fn = vi.fn();
    render(<MultiSelect aria-label="People" options={options} onValueChange={fn} />);
    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', {name: 'Alan Turing'}));
    expect(fn).not.toHaveBeenCalled();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
  it('works controlled and forwards the ref', async () => {
    const user = userEvent.setup();
    const ref = {current: null as HTMLInputElement | null};
    render(<MultiSelect aria-label="People" ref={ref} options={options} value={['grace']} />);
    expect(ref.current).toBe(screen.getByRole('combobox'));
    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', {name: 'Ada Lovelace'}));
    expect(screen.getByRole('button', {name: 'Remove Grace Hopper'})).toBeInTheDocument();
    expect(screen.queryByRole('button', {name: 'Remove Ada Lovelace'})).not.toBeInTheDocument();
  });
  it('is named by its Field and has no axe violations', async () => {
    const {container} = render(<Field label="People"><MultiSelect options={options} defaultValue={['ada']} /></Field>);
    expect(screen.getByRole('combobox', {name: 'People'})).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });
});
