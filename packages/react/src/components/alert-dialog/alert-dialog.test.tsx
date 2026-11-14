import {render, screen, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {axe} from '../../test/axe';
import {AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger} from './alert-dialog';

const ui = (onAction = () => {}) => (
  <AlertDialog>
    <AlertDialogTrigger>Delete</AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader><AlertDialogTitle>Delete project?</AlertDialogTitle><AlertDialogDescription>This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
      <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={onAction}>Delete</AlertDialogAction></AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

describe('AlertDialog', () => {
  it('opens as a named, described alertdialog with focus on Cancel', async () => {
    const user = userEvent.setup();
    render(ui());
    await user.click(screen.getByRole('button', {name: 'Delete'}));
    const dlg = await screen.findByRole('alertdialog');
    expect(dlg).toHaveAccessibleName('Delete project?');
    expect(dlg).toHaveAccessibleDescription('This cannot be undone.');
    expect(screen.getByRole('button', {name: 'Cancel'})).toHaveFocus();
  });
  it('cancels with Escape and returns focus to the trigger', async () => {
    const user = userEvent.setup();
    render(ui());
    const trigger = screen.getByRole('button', {name: 'Delete'});
    await user.click(trigger);
    await screen.findByRole('alertdialog');
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
  it('runs the action and closes', async () => {
    const user = userEvent.setup();
    const fn = vi.fn();
    render(ui(fn));
    await user.click(screen.getByRole('button', {name: 'Delete'}));
    // the page behind is inert in a browser (jsdom does not model that), so look inside the dialog
    await user.click(within(await screen.findByRole('alertdialog')).getByRole('button', {name: 'Delete'}));
    expect(fn).toHaveBeenCalled();
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });
  it('has no axe violations when open', async () => {
    const user = userEvent.setup();
    render(ui());
    await user.click(screen.getByRole('button', {name: 'Delete'}));
    await screen.findByRole('alertdialog');
    expect(await axe(document.body)).toHaveNoViolations();
  });
});
