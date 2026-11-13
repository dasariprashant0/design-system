import {act, fireEvent, render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {axe} from '../../test/axe';
import {DirectionProvider} from '../direction-provider';
import {Toaster, toast} from './toaster';

afterEach(() => act(() => { toast.dismiss(); }));

describe('toast() and Toaster', () => {
  it('shows a message with a description and dismisses it', async () => {
    const user = userEvent.setup();
    render(<Toaster />);
    act(() => { toast('Saved', {description: 'Stored on this device.'}); });
    expect(await screen.findByText('Saved')).toBeInTheDocument();
    expect(screen.getByText('Stored on this device.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', {name: 'Dismiss'}));
    expect(screen.queryByText('Saved')).not.toBeInTheDocument();
  });
  it('shows a toast made before the Toaster mounted', async () => {
    toast('Early');
    render(<Toaster />);
    expect(await screen.findByText('Early')).toBeInTheDocument();
  });
  it('marks each kind and announces errors assertively', async () => {
    render(<Toaster />);
    act(() => { toast.success('Ok'); toast.error('Broke'); });
    const ok = (await screen.findByText('Ok')).closest('li')!;
    const bad = screen.getByText('Broke').closest('li')!;
    expect(ok).toHaveAttribute('data-kind', 'success');
    expect(bad).toHaveAttribute('data-kind', 'error');
    const live = (text: string) => screen.getAllByRole('status').find((el) => el.textContent?.includes(text));
    await waitFor(() => expect(live('Broke')).toHaveAttribute('aria-live', 'assertive'));
    await waitFor(() => expect(live('Ok')).toHaveAttribute('aria-live', 'polite'));
  });
  it('runs the action', async () => {
    const user = userEvent.setup();
    const fn = vi.fn();
    render(<Toaster />);
    act(() => { toast.info('Deleted', {action: {label: 'Undo', onClick: fn}}); });
    await user.click(await screen.findByRole('button', {name: 'Undo'}));
    expect(fn).toHaveBeenCalledTimes(1);
  });
  it('dismisses by id', async () => {
    render(<Toaster />);
    let id: string | number = 0;
    act(() => { id = toast('Gone soon'); });
    await screen.findByText('Gone soon');
    act(() => { toast.dismiss(id); });
    expect(screen.queryByText('Gone soon')).not.toBeInTheDocument();
  });
  it('limits the visible stack', async () => {
    render(<Toaster limit={2} />);
    act(() => { toast('One'); toast('Two'); toast('Three'); });
    await screen.findByText('Three');
    expect(screen.queryByText('One')).not.toBeInTheDocument();
    expect(screen.getByText('Two')).toBeInTheDocument();
  });
  it('follows a promise from loading to success, and to error', async () => {
    render(<Toaster />);
    let resolve!: (v: number) => void;
    act(() => { void toast.promise(new Promise<number>((r) => { resolve = r; }), {loading: 'Saving', success: (n) => `Saved ${n}`, error: 'Failed'}); });
    expect(await screen.findByText('Saving')).toBeInTheDocument();
    await act(async () => { resolve(3); });
    expect(await screen.findByText('Saved 3')).toBeInTheDocument();
    expect(screen.queryByText('Saving')).not.toBeInTheDocument();
    const failing = Promise.reject(new Error('x'));
    act(() => { void toast.promise(failing, {loading: 'Again', success: 'Yes', error: 'Failed'}).catch(() => {}); });
    expect(await screen.findByText('Failed')).toBeInTheDocument();
  });
  it('names the region and moves focus to it with F8', async () => {
    render(<Toaster label="Alerts" />);
    act(() => { toast('Hello'); });
    await screen.findByText('Hello');
    expect(screen.getByRole('region', {name: /alerts/i})).toBeInTheDocument();
    expect(screen.getByRole('region', {name: 'Alerts (F8)'})).toBeInTheDocument();
    fireEvent.keyDown(document, {key: 'F8', code: 'F8'});
    expect(screen.getByRole('region', {name: /alerts/i}).querySelector('ol')).toHaveFocus();
  });
  it('works inside a rtl direction provider', async () => {
    render(<DirectionProvider dir="rtl"><Toaster /></DirectionProvider>);
    act(() => { toast('مرحبا'); });
    expect(await screen.findByText('مرحبا')).toBeInTheDocument();
  });
  it('has no axe violations with toasts open', async () => {
    render(<Toaster />);
    act(() => { toast.error('Broke', {description: 'Try again.', action: {label: 'Retry', onClick: () => {}}}); toast.success('Fine'); });
    await screen.findByText('Broke');
    expect(await axe(document.body)).toHaveNoViolations();
  });
});
