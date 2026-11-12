import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {axe} from '../../test/axe';
import {BlockSignup} from './block-signup';

describe('BlockSignup', () => {
  it('renders an h1 title, fields and submit', () => {
    render(<BlockSignup />);
    expect(screen.getByRole('heading', {level: 1, name: 'Create your account'})).toBeInTheDocument();
    for (const l of [/Name/, /Email/, /Password/]) expect(screen.getByLabelText(l)).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Create account'})).toBeInTheDocument();
  });
  it('lists every missing field and focuses it from the summary', async () => {
    const onSubmit = vi.fn();
    render(<BlockSignup onSubmit={onSubmit} />);
    await userEvent.click(screen.getByRole('button', {name: 'Create account'}));
    expect(screen.getByRole('link', {name: 'Enter your name.'})).toBeInTheDocument();
    expect(screen.getByRole('link', {name: 'Enter your email.'})).toBeInTheDocument();
    expect(screen.getByRole('link', {name: 'Enter your password.'})).toBeInTheDocument();
    await userEvent.click(screen.getByRole('link', {name: 'Enter your name.'}));
    expect(screen.getByLabelText(/Name/)).toHaveFocus();
    expect(onSubmit).not.toHaveBeenCalled();
  });
  it('enforces the minimum password length', async () => {
    render(<BlockSignup passwordMin={10} />);
    await userEvent.type(screen.getByLabelText(/Name/), 'Ada');
    await userEvent.type(screen.getByLabelText(/Email/), 'a@b.co');
    await userEvent.type(screen.getByLabelText(/Password/), 'short');
    await userEvent.click(screen.getByRole('button', {name: 'Create account'}));
    expect(screen.getByRole('link', {name: 'Use at least 10 characters.'})).toBeInTheDocument();
  });
  it('submits valid values', async () => {
    const onSubmit = vi.fn();
    render(<BlockSignup onSubmit={onSubmit} />);
    await userEvent.type(screen.getByLabelText(/Name/), 'Ada');
    await userEvent.type(screen.getByLabelText(/Email/), 'a@b.co');
    await userEvent.type(screen.getByLabelText(/Password/), 'longenough');
    await userEvent.click(screen.getByRole('button', {name: 'Create account'}));
    expect(onSubmit).toHaveBeenCalledWith({name: 'Ada', email: 'a@b.co', password: 'longenough'});
  });
  it('forwards ref', () => {
    const ref = {current: null as HTMLElement | null};
    render(<BlockSignup ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLElement);
  });
  it('has no axe violations, with and without errors', async () => {
    const {container} = render(<BlockSignup />);
    expect(await axe(container)).toHaveNoViolations();
    await userEvent.click(screen.getByRole('button', {name: 'Create account'}));
    expect(await axe(container)).toHaveNoViolations();
  });
});
