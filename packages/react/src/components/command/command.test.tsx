import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {axe} from '../../test/axe';
import {Command, matchesShortcut, type CommandItem} from './command';

const make = (onSelect = vi.fn()): CommandItem[] => [
  {id: 'new', label: 'New file', group: 'File', onSelect},
  {id: 'open', label: 'Open file', group: 'File', keywords: ['browse'], onSelect},
  {id: 'off', label: 'Disabled thing', group: 'File', disabled: true, onSelect},
  {id: 'theme', label: 'Switch theme', group: 'View', onSelect},
];

describe('Command', () => {
  it('is closed until opened, then shows a named dialog with a combobox and listbox', async () => {
    const user = userEvent.setup();
    render(<Command items={make()} trigger={<button type="button">Open</button>} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', {name: 'Open'}));
    expect(screen.getByRole('dialog', {name: 'Command palette'})).toBeInTheDocument();
    const input = screen.getByRole('combobox');
    expect(input).toHaveFocus();
    expect(input).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getAllByRole('group')).toHaveLength(2);
    expect(screen.getAllByRole('option')).toHaveLength(4);
  });
  it('filters by label and keywords', async () => {
    const user = userEvent.setup();
    render(<Command defaultOpen items={make()} />);
    await user.type(screen.getByRole('combobox'), 'browse');
    expect(screen.getAllByRole('option')).toHaveLength(1);
    expect(screen.getByRole('option', {name: 'Open file'})).toBeInTheDocument();
    await user.clear(screen.getByRole('combobox'));
    await user.type(screen.getByRole('combobox'), 'zzz');
    expect(screen.getByText('No results', {selector: 'p.command-empty'})).toBeInTheDocument();
  });
  it('moves with arrows (skipping disabled) and runs the item on Enter, then closes', async () => {
    const user = userEvent.setup();
    const fn = vi.fn();
    render(<Command defaultOpen items={make(fn)} />);
    const input = screen.getByRole('combobox');
    expect(screen.getByRole('option', {name: 'New file'})).toHaveAttribute('aria-selected', 'true');
    await user.keyboard('{ArrowDown}{ArrowDown}');
    expect(screen.getByRole('option', {name: 'Switch theme'})).toHaveAttribute('aria-selected', 'true');
    expect(input.getAttribute('aria-activedescendant')).toBe(screen.getByRole('option', {name: 'Switch theme'}).id);
    await user.keyboard('{Enter}');
    expect(fn).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
  it('runs an item on click', async () => {
    const user = userEvent.setup();
    const fn = vi.fn();
    render(<Command defaultOpen items={make(fn)} />);
    await user.click(screen.getByRole('option', {name: 'Open file'}));
    expect(fn).toHaveBeenCalled();
  });
  it('closes on Escape and returns focus to the trigger', async () => {
    const user = userEvent.setup();
    render(<Command items={make()} trigger={<button type="button">Open</button>} />);
    await user.click(screen.getByRole('button', {name: 'Open'}));
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Open'})).toHaveFocus();
  });
  it('toggles from the global shortcut', async () => {
    const user = userEvent.setup();
    const fn = vi.fn();
    render(<Command shortcut="mod+k" items={make()} onOpenChange={fn} />);
    await user.keyboard('{Control>}k{/Control}');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(fn).toHaveBeenLastCalledWith(true);
    await user.keyboard('{Control>}k{/Control}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
  it('can be controlled', () => {
    const {rerender} = render(<Command open={false} items={make()} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    rerender(<Command open items={make()} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
  it('matches shortcuts', () => {
    const e = {key: 'K', metaKey: true, ctrlKey: false, shiftKey: false, altKey: false};
    expect(matchesShortcut(e, 'mod+k')).toBe(true);
    expect(matchesShortcut({...e, metaKey: false}, 'mod+k')).toBe(false);
    expect(matchesShortcut(e, 'k')).toBe(false);
  });
  it('has no axe violations', async () => {
    render(<Command defaultOpen items={make()} />);
    expect(await axe(document.body)).toHaveNoViolations();
  });
});
