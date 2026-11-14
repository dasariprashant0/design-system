import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {axe} from '../../test/axe';
import {useState} from 'react';
import {Field} from '../field';
import {Combobox} from './combobox';

const options = [{value: 'ada', label: 'Ada Lovelace'}, {value: 'grace', label: 'Grace Hopper'}, {value: 'alan', label: 'Alan Turing', disabled: true}];

describe('Combobox', () => {
  it('has the combobox role, closed at first', () => {
    render(<Combobox aria-label="Person" options={options} />);
    const input = screen.getByRole('combobox', {name: 'Person'});
    expect(input).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
  it('opens on focus and filters as you type', async () => {
    const user = userEvent.setup();
    render(<Combobox aria-label="Person" options={options} />);
    await user.click(screen.getByRole('combobox'));
    expect(await screen.findByRole('listbox')).toBeInTheDocument();
    expect(screen.getAllByRole('option')).toHaveLength(3);
    await user.type(screen.getByRole('combobox'), 'gra');
    expect(screen.getAllByRole('option')).toHaveLength(1);
    expect(screen.getByRole('option', {name: 'Grace Hopper'})).toBeInTheDocument();
  });
  it('names the list after the field label', async () => {
    const user = userEvent.setup();
    render(<Field label="Person"><Combobox options={options} /></Field>);
    await user.click(screen.getByRole('combobox', {name: 'Person'}));
    expect(screen.getByRole('listbox')).toHaveAccessibleName('Person');
  });
  it('picks with the keyboard, skipping disabled options', async () => {
    const user = userEvent.setup();
    const fn = vi.fn();
    render(<Combobox aria-label="Person" options={options} onValueChange={fn} />);
    await user.click(screen.getByRole('combobox'));
    await user.keyboard('{ArrowDown}{Enter}');
    expect(fn).toHaveBeenCalledWith('grace');
    expect(screen.getByRole('combobox')).toHaveValue('Grace Hopper');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
  it('tracks the active option with aria-activedescendant', async () => {
    const user = userEvent.setup();
    render(<Combobox aria-label="Person" options={options} />);
    await user.click(screen.getByRole('combobox'));
    const input = screen.getByRole('combobox');
    const id = input.getAttribute('aria-activedescendant');
    expect(id).toBeTruthy();
    expect(document.getElementById(id!)).toHaveAttribute('role', 'option');
  });
  it('picks with the mouse and closes with Escape', async () => {
    const user = userEvent.setup();
    render(<Combobox aria-label="Person" options={options} defaultValue="ada" />);
    expect(screen.getByRole('combobox')).toHaveValue('Ada Lovelace');
    await user.click(screen.getByRole('combobox'));
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', {name: 'Grace Hopper'}));
    expect(screen.getByRole('combobox')).toHaveValue('Grace Hopper');
  });
  it('shows an empty message', async () => {
    const user = userEvent.setup();
    render(<Combobox aria-label="Person" options={options} />);
    await user.type(screen.getByRole('combobox'), 'zzz');
    expect(screen.getByText('No matches')).toBeInTheDocument();
  });
  it('works controlled and inside a Field', async () => {
    const user = userEvent.setup();
    function C() { const [v, setV] = useState('ada'); return <><Field label="Person"><Combobox options={options} value={v} onValueChange={setV} /></Field><output>{v}</output></>; }
    render(<C />);
    expect(screen.getByLabelText('Person')).toHaveValue('Ada Lovelace');
    await user.click(screen.getByLabelText('Person'));
    await user.click(screen.getByRole('option', {name: 'Grace Hopper'}));
    expect(screen.getByText('grace', {selector: 'output'})).toBeInTheDocument();
  });
  it('has no axe violations open', async () => {
    const user = userEvent.setup();
    const {container} = render(<Combobox aria-label="Person" options={options} />);
    await user.click(screen.getByRole('combobox'));
    expect(await axe(container)).toHaveNoViolations();
  });
});
