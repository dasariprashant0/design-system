import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {axe} from '../../test/axe';
import {useState} from 'react';
import {Toast, ToastAction, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport} from './toast';

function Demo({onUndo = () => {}}: {onUndo?: () => void}) {
  const [open, setOpen] = useState(false);
  return (
    <ToastProvider duration={60000}>
      <button onClick={() => setOpen(true)}>Save</button>
      <Toast open={open} onOpenChange={setOpen}>
        <ToastTitle>Saved</ToastTitle><ToastDescription>Draft stored.</ToastDescription>
        <ToastAction altText="Undo the save" onClick={onUndo}>Undo</ToastAction><ToastClose />
      </Toast>
      <ToastViewport label="Notifications" />
    </ToastProvider>
  );
}

describe('Toast', () => {
  it('shows when opened and announces its content', async () => {
    const user = userEvent.setup();
    render(<Demo />);
    expect(screen.queryByText('Saved')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', {name: 'Save'}));
    expect(await screen.findByText('Draft stored.')).toBeInTheDocument();
    expect(screen.getByRole('region', {name: /notifications/i})).toBeInTheDocument();
  });
  it('dismisses with the close button', async () => {
    const user = userEvent.setup();
    render(<Demo />);
    await user.click(screen.getByRole('button', {name: 'Save'}));
    await user.click(await screen.findByRole('button', {name: 'Dismiss'}));
    expect(screen.queryByText('Draft stored.')).not.toBeInTheDocument();
  });
  it('runs the action', async () => {
    const user = userEvent.setup();
    const fn = vi.fn();
    render(<Demo onUndo={fn} />);
    await user.click(screen.getByRole('button', {name: 'Save'}));
    await user.click(await screen.findByRole('button', {name: 'Undo'}));
    expect(fn).toHaveBeenCalled();
  });
  it('has no axe violations when open', async () => {
    const user = userEvent.setup();
    render(<Demo />);
    await user.click(screen.getByRole('button', {name: 'Save'}));
    await screen.findByText('Draft stored.');
    expect(await axe(document.body)).toHaveNoViolations();
  });
});
