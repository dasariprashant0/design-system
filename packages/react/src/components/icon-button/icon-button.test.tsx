import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {axe} from '../../test/axe';
import {IconButton} from './icon-button';

const Icon = () => <svg aria-hidden="true" viewBox="0 0 10 10" width="10" height="10"><path d="M0 5h10" stroke="currentColor" /></svg>;

describe('IconButton', () => {
  it('is a named button with the icon class', () => {
    render(<IconButton aria-label="Remove"><Icon /></IconButton>);
    expect(screen.getByRole('button', {name: 'Remove'})).toHaveClass('btn', 'btn-icon');
  });
  it('fires onClick and respects disabled', async () => {
    const user = userEvent.setup();
    const fn = vi.fn();
    render(<><IconButton aria-label="A" onClick={fn}><Icon /></IconButton><IconButton aria-label="B" disabled onClick={fn}><Icon /></IconButton></>);
    await user.click(screen.getByRole('button', {name: 'A'}));
    await user.click(screen.getByRole('button', {name: 'B'}));
    expect(fn).toHaveBeenCalledTimes(1);
  });
  it('has no axe violations', async () => {
    const {container} = render(<IconButton aria-label="Remove"><Icon /></IconButton>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
