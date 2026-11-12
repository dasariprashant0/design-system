'use client';
import {forwardRef, useId, useState, type HTMLAttributes, type ReactNode} from 'react';
import {cx} from '../../utils/cx';
import {Button} from '../button';
import {Field} from '../field';
import {Form, FormActions, type FormError} from '../form';
import {Heading} from '../heading';
import {Input} from '../input';
import {PasswordInput} from '../password-input';
import {Text} from '../text';

export interface SignupValues {
  name: string;
  email: string;
  password: string;
}

export interface BlockSignupProps extends Omit<HTMLAttributes<HTMLElement>, 'title' | 'onSubmit'> {
  /** Heading of the form. Default "Create your account". */
  title?: ReactNode;
  /** Optional muted line under the heading. */
  description?: ReactNode;
  /** Text of the submit button. Default "Create account". */
  submitLabel?: ReactNode;
  /** Called with the values once they pass validation. */
  onSubmit?: (values: SignupValues) => void;
  /** Shows a spinner on the submit button while you sign in. */
  loading?: boolean;
  /** Links under the form: forgot password, create an account. */
  footer?: ReactNode;
  /** Replace the validation messages (translate them, or change the tone). */
  messages?: Partial<{name: string; email: string; emailInvalid: string; password: string; passwordShort: string}>;
  /** Shortest password accepted. Default 8. */
  passwordMin?: number;
  /** Outline level of the title, 1 to 3. Default 1 because a signup page is usually the page's h1. */
  headingLevel?: 1 | 2 | 3;
}

/** Name, email and password with a submit button. Validation messages show in an error summary and under each field. */
export const BlockSignup = forwardRef<HTMLElement, BlockSignupProps>(function BlockSignup({title = 'Create your account', description, submitLabel = 'Create account', onSubmit, loading, footer, messages, passwordMin = 8, headingLevel = 1, className, ...rest}, ref) {
  const id = useId();
  const [errors, setErrors] = useState<FormError[]>([]);
  const m = {name: 'Enter your name.', passwordShort: `Use at least ${passwordMin} characters.`, email: 'Enter your email.', emailInvalid: 'Enter an email like name@example.com.', password: 'Enter your password.', ...messages};
  const msg = (name: string) => errors.find((e) => e.name === name)?.message;
  return (
    <section ref={ref} className={cx('block-signup', className)} aria-labelledby={id} {...rest}>
      <div className="block-signup-head">
        <Heading id={id} level={headingLevel} size="xl">{title}</Heading>
        {description && <Text tone="muted">{description}</Text>}
      </div>
      <Form
        aria-labelledby={id}
        noValidate
        preventDefault
        errors={errors}
        onSubmit={(e) => {
          const data = new FormData(e.currentTarget);
          const name = String(data.get('name') ?? '').trim();
          const email = String(data.get('email') ?? '').trim();
          const password = String(data.get('password') ?? '');
          const next: FormError[] = [];
          if (!name) next.push({name: 'name', message: m.name});
          if (!email) next.push({name: 'email', message: m.email});
          else if (!/^\S+@\S+\.\S+$/.test(email)) next.push({name: 'email', message: m.emailInvalid});
          if (!password) next.push({name: 'password', message: m.password});
          else if (password.length < passwordMin) next.push({name: 'password', message: m.passwordShort});
          setErrors(next);
          if (!next.length) onSubmit?.({name, email, password});
        }}
      >
        <Field label="Name" required error={msg('name')}><Input name="name" autoComplete="name" /></Field>
        <Field label="Email" required error={msg('email')}><Input name="email" type="email" autoComplete="email" /></Field>
        <Field label="Password" required hint={`At least ${passwordMin} characters.`} error={msg('password')}><PasswordInput name="password" autoComplete="new-password" /></Field>
        <FormActions><Button type="submit" variant="solid" loading={loading}>{submitLabel}</Button></FormActions>
      </Form>
      {footer && <div className="block-signup-footer">{footer}</div>}
    </section>
  );
});
