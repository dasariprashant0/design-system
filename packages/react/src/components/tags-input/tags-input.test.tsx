import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {axe} from '../../test/axe';
import {Field} from '../field';
import {TagsInput} from './tags-input';

describe('TagsInput', () => {
  it('adds a tag on Enter and clears the field', async () => {
    const user = userEvent.setup();
    const fn = vi.fn();
    render(<TagsInput aria-label="Keywords" onValueChange={fn} />);
    await user.type(screen.getByRole('textbox', {name: 'Keywords'}), 'alpha{Enter}');
    expect(fn).toHaveBeenCalledWith(['alpha']);
    expect(screen.getByRole('textbox')).toHaveValue('');
    expect(screen.getByRole('button', {name: 'Remove alpha'})).toBeInTheDocument();
  });
  it('adds on comma, trims, and ignores blanks and duplicates', async () => {
    const user = userEvent.setup();
    const fn = vi.fn();
    render(<TagsInput aria-label="Keywords" onValueChange={fn} defaultValue={['a']} />);
    await user.type(screen.getByRole('textbox'), ' b ,a,,{Enter}');
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(['a', 'b']);
  });
  it('removes the last tag with Backspace only when the field is empty', async () => {
    const user = userEvent.setup();
    render(<TagsInput aria-label="Keywords" defaultValue={['a', 'b']} />);
    await user.type(screen.getByRole('textbox'), 'x');
    await user.keyboard('{Backspace}');
    expect(screen.getByRole('button', {name: 'Remove b'})).toBeInTheDocument();
    await user.keyboard('{Backspace}');
    expect(screen.queryByRole('button', {name: 'Remove b'})).not.toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Remove a'})).toBeInTheDocument();
  });
  it('removes a tag with its button', async () => {
    const user = userEvent.setup();
    render(<TagsInput aria-label="Keywords" defaultValue={['a', 'b']} />);
    await user.click(screen.getByRole('button', {name: 'Remove a'}));
    expect(screen.queryByRole('button', {name: 'Remove a'})).not.toBeInTheDocument();
  });
  it('adds pending text on blur', async () => {
    const user = userEvent.setup();
    render(<TagsInput aria-label="Keywords" />);
    await user.type(screen.getByRole('textbox'), 'late');
    await user.tab();
    expect(screen.getByRole('button', {name: 'Remove late'})).toBeInTheDocument();
  });
  it('works controlled, disabled and forwards the ref', () => {
    const ref = {current: null as HTMLInputElement | null};
    render(<TagsInput aria-label="Keywords" ref={ref} value={['a']} disabled />);
    expect(ref.current).toBe(screen.getByRole('textbox'));
    expect(screen.getByRole('textbox')).toBeDisabled();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
  it('has no axe violations', async () => {
    const {container} = render(<Field label="Keywords"><TagsInput defaultValue={['a']} /></Field>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
