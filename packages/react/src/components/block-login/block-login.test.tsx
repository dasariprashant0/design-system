import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {axe} from '../../test/axe';
import {BlockLogin} from './block-login';

describe('BlockLogin', () => {
  it('renders an h1 title, fields and submit', () => {
    render(<BlockLogin />);
    expect(screen.getByRole('heading', {level: 1, name: 'Sign in'})).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/)).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Sign in'})).toBeInTheDocument();
  });
  it('shows a summary and field errors when empty, and does not submit', async () => {
    const onSubmit = vi.fn();
    render(<BlockLogin onSubmit={onSubmit} />);
    await userEvent.click(screen.getByRole('button', {name: 'Sign in'}));
    expect(screen.getByRole('link', {name: 'Enter your email.'})).toBeInTheDocument();
    expect(screen.getByRole('link', {name: 'Enter your password.'})).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/)).toBeInvalid();
    expect(onSubmit).not.toHaveBeenCalled();
  });
  it('moves focus to the field from the summary link', async () => {
    render(<BlockLogin />);
    await userEvent.click(screen.getByRole('button', {name: 'Sign in'}));
    await userEvent.click(screen.getByRole('link', {name: 'Enter your email.'}));
    expect(screen.getByLabelText(/Email/)).toHaveFocus();
  });
  it('rejects a malformed email', async () => {
    render(<BlockLogin />);
    await userEvent.type(screen.getByLabelText(/Email/), 'nope');
    await userEvent.type(screen.getByLabelText(/Password/), 'secret');
    await userEvent.click(screen.getByRole('button', {name: 'Sign in'}));
    expect(screen.getByRole('link', {name: 'Enter an email like name@example.com.'})).toBeInTheDocument();
  });
  it('submits valid values', async () => {
    const onSubmit = vi.fn();
    render(<BlockLogin onSubmit={onSubmit} />);
    await userEvent.type(screen.getByLabelText(/Email/), 'a@b.co');
    await userEvent.type(screen.getByLabelText(/Password/), 'secret');
    await userEvent.click(screen.getByRole('button', {name: 'Sign in'}));
    expect(onSubmit).toHaveBeenCalledWith({email: 'a@b.co', password: 'secret'});
    expect(screen.queryByRole('alert')).toBeNull();
  });
  it('forwards ref', () => {
    const ref = {current: null as HTMLElement | null};
    render(<BlockLogin ref={ref} footer={<a href="/x">Create an account</a>} />);
    expect(ref.current).toBeInstanceOf(HTMLElement);
    expect(screen.getByRole('link', {name: 'Create an account'})).toBeInTheDocument();
  });
  it('has no axe violations, with and without errors', async () => {
    const {container} = render(<BlockLogin description="Welcome back." />);
    expect(await axe(container)).toHaveNoViolations();
    await userEvent.click(screen.getByRole('button', {name: 'Sign in'}));
    expect(await axe(container)).toHaveNoViolations();
  });
});
