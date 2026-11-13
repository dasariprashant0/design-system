import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {axe} from '../../test/axe';
import {Field} from '../field';
import {Mentions, type MentionOption} from './mentions';

const people: MentionOption[] = [
  {value: 'ada', label: 'Ada Lovelace'},
  {value: 'grace', label: 'Grace Hopper'},
  {value: 'alan', label: 'Alan Turing', disabled: true},
];
const box = () => screen.getByRole('textbox');

describe('Mentions', () => {
  it('is a textbox with a popup that opens only after the trigger', async () => {
    const user = userEvent.setup();
    render(<Mentions aria-label="Comment" options={people} />);
    expect(box()).toHaveAttribute('aria-haspopup', 'listbox');
    expect(box()).not.toHaveAttribute('aria-controls');
    await user.type(box(), 'hello ');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    await user.type(box(), '@');
    expect(box()).toHaveAttribute('aria-controls', screen.getByRole('listbox').id);
    expect(screen.getAllByRole('option')).toHaveLength(3);
  });
  it('does not open for a trigger inside a word such as an email', async () => {
    const user = userEvent.setup();
    render(<Mentions aria-label="Comment" options={people} />);
    await user.type(box(), 'me@');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
  it('filters by the query and inserts with Enter', async () => {
    const user = userEvent.setup();
    const fn = vi.fn(), sel = vi.fn();
    render(<Mentions aria-label="Comment" options={people} onValueChange={fn} onMentionSelect={sel} />);
    await user.type(box(), 'hi @gr');
    expect(screen.getAllByRole('option')).toHaveLength(1);
    expect(box()).toHaveAttribute('aria-activedescendant', screen.getByRole('option').id);
    await user.keyboard('{Enter}');
    expect(box()).toHaveValue('hi @grace ');
    expect(fn).toHaveBeenLastCalledWith('hi @grace ');
    expect(sel).toHaveBeenCalledWith(people[1], '@');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(box()).toHaveFocus();
  });
  it('moves with arrow keys, skipping disabled options, and inserts with Tab', async () => {
    const user = userEvent.setup();
    render(<Mentions aria-label="Comment" options={people} />);
    await user.type(box(), '@');
    expect(screen.getByRole('option', {name: 'Ada Lovelace'})).toHaveAttribute('aria-selected', 'true');
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('option', {name: 'Grace Hopper'})).toHaveAttribute('aria-selected', 'true');
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('option', {name: 'Ada Lovelace'})).toHaveAttribute('aria-selected', 'true');
    await user.keyboard('{ArrowUp}{Tab}');
    expect(box()).toHaveValue('@grace ');
  });
  it('inserts with a click and keeps text around the mention', async () => {
    const user = userEvent.setup();
    render(<Mentions aria-label="Comment" options={people} defaultValue="Hi  thanks" />);
    box().focus();
    (box() as HTMLTextAreaElement).setSelectionRange(3, 3);
    await user.keyboard('@a');
    await user.click(screen.getByRole('option', {name: 'Ada Lovelace'}));
    expect(box()).toHaveValue('Hi @ada  thanks');
  });
  it('closes with Escape without inserting, and keeps the text', async () => {
    const user = userEvent.setup();
    render(<Mentions aria-label="Comment" options={people} />);
    await user.type(box(), '@a');
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(box()).toHaveValue('@a');
  });
  it('supports other triggers', async () => {
    const user = userEvent.setup();
    render(<Mentions aria-label="Comment" options={people} triggers={['#']} />);
    await user.type(box(), '@');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    await user.type(box(), ' #');
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });
  it('loads options with onSearch and ignores stale answers', async () => {
    const user = userEvent.setup();
    const resolvers: Record<string, (o: MentionOption[]) => void> = {};
    const search = vi.fn((q: string) => new Promise<MentionOption[]>((r) => { resolvers[q] = r; }));
    render(<Mentions aria-label="Comment" onSearch={search} />);
    await user.type(box(), '@a');
    expect(screen.getByRole('status')).toHaveTextContent('Loading');
    resolvers['']!([{value: 'old', label: 'Old'}]);
    resolvers['a']!([{value: 'ada', label: 'Ada'}]);
    expect(await screen.findByRole('option', {name: 'Ada'})).toBeInTheDocument();
    expect(screen.queryByRole('option', {name: 'Old'})).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('1 suggestion');
    await user.keyboard('{Enter}');
    expect(box()).toHaveValue('@ada ');
  });
  it('shows an empty message', async () => {
    const user = userEvent.setup();
    render(<Mentions aria-label="Comment" options={people} />);
    await user.type(box(), '@zzz');
    expect(screen.getByText('No matches', {selector: 'li'})).toBeInTheDocument();
  });
  it('is controlled', async () => {
    const user = userEvent.setup();
    render(<Mentions aria-label="Comment" options={people} value="fixed" />);
    await user.type(box(), 'x');
    expect(box()).toHaveValue('fixed');
  });
  it('is labelled by a Field and forwards its ref', () => {
    render(<Field label="Comment"><Mentions options={people} /></Field>);
    expect(screen.getByLabelText('Comment')).toBe(box());
  });
  it('has no axe violations, open or closed', async () => {
    const user = userEvent.setup();
    const {container} = render(<Mentions aria-label="Comment" options={people} />);
    expect(await axe(container)).toHaveNoViolations();
    await user.type(box(), '@');
    expect(await axe(container)).toHaveNoViolations();
  });
});
