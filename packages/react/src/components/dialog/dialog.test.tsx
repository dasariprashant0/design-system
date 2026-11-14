import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {axe} from '../../test/axe';
import {Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger} from './dialog';

const ui = () => (
  <Dialog>
    <DialogTrigger>Open</DialogTrigger>
    <DialogContent><DialogTitle>Title</DialogTitle><DialogDescription>Details</DialogDescription></DialogContent>
  </Dialog>
);

describe('Dialog', () => {
  it('opens from the trigger as a named, described dialog', async () => {
    const user = userEvent.setup();
    render(ui());
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', {name: 'Open'}));
    const dlg = await screen.findByRole('dialog');
    expect(dlg).toHaveAccessibleName('Title');
    expect(dlg).toHaveAccessibleDescription('Details');
  });
  it('reports itself as modal', async () => {
    const user = userEvent.setup();
    render(ui());
    await user.click(screen.getByRole('button', {name: 'Open'}));
    expect(await screen.findByRole('dialog')).toHaveAttribute('aria-modal', 'true');
  });
  it('closes with Escape and returns focus to the trigger', async () => {
    const user = userEvent.setup();
    render(ui());
    const trigger = screen.getByRole('button', {name: 'Open'});
    await user.click(trigger);
    await screen.findByRole('dialog');
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
  it('closes with the Close button', async () => {
    const user = userEvent.setup();
    render(ui());
    await user.click(screen.getByRole('button', {name: 'Open'}));
    await user.click(await screen.findByRole('button', {name: 'Close'}));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
  it('has no axe violations when open', async () => {
    const user = userEvent.setup();
    render(ui());
    await user.click(screen.getByRole('button', {name: 'Open'}));
    const dlg = await screen.findByRole('dialog');
    expect(await axe(dlg)).toHaveNoViolations();
  });
});
