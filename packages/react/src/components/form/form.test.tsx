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
});
