import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {axe} from '../../test/axe';
import {Form, FormActions} from './form';
import {Field} from '../field';
import {Input} from '../input';
import {Button} from '../button';

describe('Form', () => {
  it('calls onSubmit and prevents the default only when asked', async () => {
    const onSubmit = vi.fn();
    render(<Form preventDefault onSubmit={onSubmit} aria-label="f"><Button type="submit">Save</Button></Form>);
    await userEvent.click(screen.getByRole('button', {name: 'Save'}));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0]![0].defaultPrevented).toBe(true);
  });
  it('leaves the default alone without preventDefault', async () => {
    const onSubmit = vi.fn((e: {preventDefault: () => void}) => e.preventDefault());
    render(<Form onSubmit={(e) => { expect(e.defaultPrevented).toBe(false); onSubmit(e); }} aria-label="f"><Button type="submit">Save</Button></Form>);
    await userEvent.click(screen.getByRole('button', {name: 'Save'}));
    expect(onSubmit).toHaveBeenCalled();
  });
  it('shows no summary without errors', () => {
    render(<Form aria-label="f">x</Form>);
    expect(screen.queryByRole('alert')).toBeNull();
  });
  it('lists errors in an alert and links focus to the control', async () => {
    render(
      <Form aria-label="f" errors={[{name: 'email', message: 'Enter your email.'}]}>
        <Field label="Email" error="Enter your email."><Input name="email" /></Field>
      </Form>,
    );
    const summary = screen.getAllByRole('alert')[0]!;
    expect(summary).toHaveTextContent('Fix these to continue');
    await userEvent.click(screen.getByRole('link', {name: 'Enter your email.'}));
    expect(screen.getByLabelText('Email')).toHaveFocus();
  });
  it('forwards ref and renders FormActions', () => {
    const ref = {current: null as HTMLFormElement | null};
    render(<Form ref={ref} aria-label="f"><FormActions data-testid="a">x</FormActions></Form>);
    expect(ref.current).toBeInstanceOf(HTMLFormElement);
    expect(screen.getByTestId('a')).toHaveClass('form-actions');
  });
  it('has no axe violations', async () => {
    const {container} = render(
      <Form aria-label="Sign in" errors={[{name: 'email', message: 'Enter your email.'}]}>
        <Field label="Email" error="Enter your email."><Input name="email" /></Field>
        <FormActions><Button type="submit" variant="solid">Save</Button></FormActions>
      </Form>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
  it('passes an error once: Fields read their message from the Form by name', async () => {
    render(
      <Form aria-label="f" errors={[{name: 'email', message: 'Enter your email.'}]}>
        <Field label="Name" name="name"><Input name="name" /></Field>
        <Field label="Email" name="email"><Input name="email" /></Field>
      </Form>,
    );
    const email = screen.getByLabelText('Email');
    expect(email).toHaveAttribute('aria-invalid', 'true');
    expect(email).toHaveAccessibleDescription('Enter your email.');
    expect(screen.getByLabelText('Name')).not.toHaveAttribute('aria-invalid');
    // One copy in the summary link, one inline; only the summary is an alert.
    expect(screen.getAllByText('Enter your email.')).toHaveLength(2);
    expect(screen.getAllByRole('alert')).toHaveLength(1);
    await userEvent.click(screen.getByRole('link', {name: 'Enter your email.'}));
    expect(email).toHaveFocus();
  });
  it('lets a Field error prop override the form error and has no axe violations', async () => {
    const {container} = render(
      <Form aria-label="f" errors={[{name: 'email', message: 'From form.'}]}>
        <Field label="Email" name="email" error="Own error."><Input name="email" /></Field>
      </Form>,
    );
    expect(screen.getByLabelText('Email')).toHaveAccessibleDescription('Own error.');
    expect(await axe(container)).toHaveNoViolations();
  });
});
