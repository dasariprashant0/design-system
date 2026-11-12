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

export interface LoginValues {
  email: string;
  password: string;
}

export interface BlockLoginProps extends Omit<HTMLAttributes<HTMLElement>, 'title' | 'onSubmit'> {
  title?: ReactNode;
  description?: ReactNode;
  submitLabel?: ReactNode;
  /** Called with the values once they pass validation. */
  onSubmit?: (values: LoginValues) => void;
  /** Shows a spinner on the submit button while you sign in. */
  loading?: boolean;
  /** Links under the form: forgot password, create an account. */
  footer?: ReactNode;
  /** Replace the validation messages (translate them, or change the tone). */
  messages?: Partial<{email: string; emailInvalid: string; password: string}>;
  headingLevel?: 1 | 2 | 3;
}

/** Email and password with a submit button. Validation messages show in an error summary and under each field. */
export const BlockLogin = forwardRef<HTMLElement, BlockLoginProps>(function BlockLogin({title = 'Sign in', description, submitLabel = 'Sign in', onSubmit, loading, footer, messages, headingLevel = 1, className, ...rest}, ref) {
  const id = useId();
  const [errors, setErrors] = useState<FormError[]>([]);
  const m = {email: 'Enter your email.', emailInvalid: 'Enter an email like name@example.com.', password: 'Enter your password.', ...messages};
  const msg = (name: string) => errors.find((e) => e.name === name)?.message;
  return (
    <section ref={ref} className={cx('block-login', className)} aria-labelledby={id} {...rest}>
      <div className="block-login-head">
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
          const email = String(data.get('email') ?? '').trim();
          const password = String(data.get('password') ?? '');
          const next: FormError[] = [];
          if (!email) next.push({name: 'email', message: m.email});
          else if (!/^\S+@\S+\.\S+$/.test(email)) next.push({name: 'email', message: m.emailInvalid});
          if (!password) next.push({name: 'password', message: m.password});
          setErrors(next);
          if (!next.length) onSubmit?.({email, password});
        }}
      >
        <Field label="Email" required error={msg('email')}><Input name="email" type="email" autoComplete="email" /></Field>
        <Field label="Password" required error={msg('password')}><PasswordInput name="password" autoComplete="current-password" /></Field>
        <FormActions><Button type="submit" variant="solid" loading={loading}>{submitLabel}</Button></FormActions>
      </Form>
      {footer && <div className="block-login-footer">{footer}</div>}
    </section>
  );
});
