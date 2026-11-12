// Code shown in the Forms guide. Kept as plain strings so the docs app needs no form library.
// Monoline prop names were type-checked against @monoline/react (react-hook-form was stubbed); the library calls follow the v7 / v1 docs.

export const registerSnippet = `import {useForm} from 'react-hook-form';
import {Button, Field, Form, FormActions, Input, NativeSelect, NumberInput, PasswordInput, Textarea} from '@monoline/react';

interface Values { email: string; password: string; plan: string; seats: number; notes: string }

export function SignupForm() {
  const {register, handleSubmit, formState: {errors, isSubmitting}} = useForm<Values>({
    defaultValues: {email: '', password: '', plan: 'team', seats: 5, notes: ''},
  });
  const onSubmit = async (values: Values) => { await saveAccount(values); };

  return (
    <Form noValidate onSubmit={handleSubmit(onSubmit)}>
      <Field label="Email" required error={errors.email?.message}>
        <Input type="email" autoComplete="email" {...register('email', {
          required: 'Enter your email',
          pattern: {value: /^\\S+@\\S+\\.\\S+$/, message: 'Enter an email like name@company.com'},
        })} />
      </Field>
      <Field label="Password" hint="At least 12 characters." required error={errors.password?.message}>
        <PasswordInput autoComplete="new-password" {...register('password', {
          required: 'Choose a password',
          minLength: {value: 12, message: 'Use at least 12 characters'},
        })} />
      </Field>
      <Field label="Plan">
        <NativeSelect {...register('plan')}>
          <option value="solo">Solo</option>
          <option value="team">Team</option>
        </NativeSelect>
      </Field>
      <Field label="Seats" error={errors.seats?.message}>
        <NumberInput min={1} max={500} {...register('seats', {valueAsNumber: true, min: {value: 1, message: 'At least one seat'}})} />
      </Field>
      <Field label="Notes">
        <Textarea rows={3} {...register('notes')} />
      </Field>
      <FormActions>
        <Button type="submit" variant="solid" loading={isSubmitting}>Create account</Button>
      </FormActions>
    </Form>
  );
}`;

export const controllerSnippet = `import {Controller, useForm} from 'react-hook-form';
import {
  Button, Checkbox, Combobox, DatePicker, Field, Form, FormActions,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@monoline/react';

interface Values { country: string; role: string; start: Date | null; terms: boolean }

const countries = [{value: 'in', label: 'India'}, {value: 'de', label: 'Germany'}, {value: 'us', label: 'United States'}];

export function ProfileForm() {
  const {control, handleSubmit, formState: {isSubmitting}} = useForm<Values>({
    defaultValues: {country: '', role: '', start: null, terms: false},
  });
  return (
    <Form noValidate onSubmit={handleSubmit(async (v) => { await saveProfile(v); })}>
      <Controller control={control} name="country" rules={{required: 'Choose a country'}} render={({field, fieldState}) => (
        <Field label="Country" required error={fieldState.error?.message}>
          <Combobox ref={field.ref} name={field.name} value={field.value} onValueChange={field.onChange} onBlur={field.onBlur} options={countries} placeholder="Search countries" />
        </Field>
      )} />

      <Controller control={control} name="role" rules={{required: 'Choose a role'}} render={({field, fieldState}) => (
        <Field label="Role" required error={fieldState.error?.message}>
          <Select name={field.name} value={field.value} onValueChange={field.onChange}>
            <SelectTrigger ref={field.ref} onBlur={field.onBlur}><SelectValue placeholder="Choose a role" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="editor">Editor</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      )} />

      <Controller control={control} name="start" rules={{validate: (d) => d !== null || 'Pick a start date'}} render={({field, fieldState}) => (
        <Field label="Start date" required error={fieldState.error?.message}>
          <DatePicker ref={field.ref} value={field.value} onValueChange={field.onChange} min={new Date()} />
        </Field>
      )} />

      <Controller control={control} name="terms" rules={{validate: (v) => v || 'Accept the terms to continue'}} render={({field, fieldState}) => (
        <Field label="Terms" error={fieldState.error?.message}>
          <Checkbox ref={field.ref} checked={field.value} onCheckedChange={(c) => field.onChange(c === true)} label="I accept the terms" />
        </Field>
      )} />

      <FormActions>
        <Button type="submit" variant="solid" loading={isSubmitting}>Save profile</Button>
      </FormActions>
    </Form>
  );
}`;

export const moreControlledSnippet = `import {Controller, useForm} from 'react-hook-form';
import {Field, Fieldset, OtpInput, RadioGroup, RadioGroupItem, Rating, SegmentedControl, Slider, Switch} from '@monoline/react';

interface Values { code: string; billing: string; score: number; budget: number; view: string; alerts: boolean }

export function ControlledExamples() {
  const {control} = useForm<Values>({defaultValues: {code: '', billing: 'monthly', score: 0, budget: 40, view: 'list', alerts: true}});
  return (
    <>
      <Controller control={control} name="code" rules={{minLength: {value: 6, message: 'Enter all 6 digits'}}} render={({field, fieldState}) => (
        <Field label="Verification code" error={fieldState.error?.message}>
          <OtpInput aria-label="Verification code" length={6} value={field.value} onValueChange={field.onChange} invalid={!!fieldState.error} />
        </Field>
      )} />

      <Controller control={control} name="billing" render={({field}) => (
        <Fieldset legend="Billing">
          <RadioGroup name={field.name} value={field.value} onValueChange={field.onChange}>
            <RadioGroupItem value="monthly" label="Monthly" />
            <RadioGroupItem value="yearly" label="Yearly" />
          </RadioGroup>
        </Fieldset>
      )} />

      <Controller control={control} name="score" rules={{min: {value: 1, message: 'Choose a rating'}}} render={({field, fieldState}) => (
        <Field label="Rating" error={fieldState.error?.message}>
          <Rating aria-label="Rating" value={field.value} onValueChange={field.onChange} />
        </Field>
      )} />

      <Controller control={control} name="budget" render={({field}) => (
        <Field label="Budget">
          <Slider aria-label="Budget" min={0} max={100} step={5} value={field.value} onValueChange={(v) => field.onChange(v[0])} />
        </Field>
      )} />

      <Controller control={control} name="view" render={({field}) => (
        <Field label="Default view">
          <SegmentedControl aria-label="Default view" value={field.value} onValueChange={field.onChange} options={[{value: 'list', label: 'List'}, {value: 'grid', label: 'Grid'}]} />
        </Field>
      )} />

      <Controller control={control} name="alerts" render={({field}) => (
        <Switch label="Email me about changes" checked={field.value} onCheckedChange={field.onChange} />
      )} />
    </>
  );
}`;

export const zodSnippet = `import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';

const schema = z.object({
  email: z.string().min(1, 'Enter your email').email('Enter an email like name@company.com'),
  password: z.string().min(12, 'Use at least 12 characters'),
  seats: z.number({message: 'Enter a number'}).int().min(1, 'At least one seat'),
});
type Values = z.infer<typeof schema>;

const form = useForm<Values>({resolver: zodResolver(schema), defaultValues: {email: '', password: '', seats: 5}});
// register('seats', {valueAsNumber: true}) keeps the value a number, so the schema sees a number.`;

export const summarySnippet = `import {Alert, Button, Field, Form, FormActions, Input, type FormError} from '@monoline/react';

// Inside the component from the first example:
const {register, handleSubmit, setError, formState: {errors, isSubmitting}} = useForm<Values>();

// 1. Build the summary from RHF's errors. Each "name" must match the control's name attribute.
const summary: FormError[] = Object.entries(errors).map(([name, e]) => ({name, message: e?.message ?? 'Check this field'}));

// 2. A failure from the server can be put on a field, or on the form.
const onSubmit = handleSubmit(async (values) => {
  const res = await saveAccount(values);
  if (res.status === 409) setError('email', {message: 'That email already has an account'});
  else if (!res.ok) setError('root.server', {message: 'We could not save. Try again.'});
});

return (
  <Form noValidate errors={summary} onSubmit={onSubmit}>
    {errors.root?.server && <Alert tone="danger" title="Not saved">{errors.root.server.message}</Alert>}
    <Field label="Email" required error={errors.email?.message}>
      <Input type="email" {...register('email', {required: 'Enter your email'})} />
    </Field>
    <FormActions>
      <Button type="submit" variant="solid" loading={isSubmitting}>Create account</Button>
    </FormActions>
  </Form>
);`;

export const plainSnippet = `import {useState, type FormEvent} from 'react';
import {Button, Field, Form, FormActions, Input, type FormError} from '@monoline/react';

type Errors = Record<string, string>;
const validate = (email: string, password: string): Errors => {
  const e: Errors = {};
  if (!email) e.email = 'Enter your email';
  else if (!/^\\S+@\\S+\\.\\S+$/.test(email)) e.email = 'Enter an email like name@company.com';
  if (password.length < 12) e.password = 'Use at least 12 characters';
  return e;
};

export function PlainForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);

  const submit = async (_e: FormEvent<HTMLFormElement>) => {
    const next = validate(email, password);
    setErrors(next);
    if (Object.keys(next).length) return;
    setBusy(true);
    try { await saveAccount({email, password}); } finally { setBusy(false); }
  };
  const summary: FormError[] = Object.entries(errors).map(([name, message]) => ({name, message}));

  return (
    <Form noValidate preventDefault errors={summary} onSubmit={submit}>
      <Field label="Email" required error={errors.email}>
        <Input name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </Field>
      <Field label="Password" required error={errors.password}>
        <Input name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </Field>
      <FormActions><Button type="submit" variant="solid" loading={busy}>Create account</Button></FormActions>
    </Form>
  );
}`;

export const tanstackSnippet = `import {useForm} from '@tanstack/react-form';
import {Button, Field, Form, FormActions, Input} from '@monoline/react';

export function TanStackExample() {
  const form = useForm({
    defaultValues: {email: ''},
    onSubmit: async ({value}) => { await saveAccount(value); },
  });
  return (
    <Form noValidate preventDefault onSubmit={() => { void form.handleSubmit(); }}>
      <form.Field
        name="email"
        validators={{onBlur: ({value}) => (value ? undefined : 'Enter your email')}}
        children={(field) => (
          <Field label="Email" required error={field.state.meta.isTouched ? field.state.meta.errors.join(', ') || undefined : undefined}>
            <Input name={field.name} type="email" value={field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.value)} />
          </Field>
        )}
      />
      <FormActions>
        <form.Subscribe selector={(s) => s.isSubmitting} children={(busy) => <Button type="submit" variant="solid" loading={busy}>Create account</Button>} />
      </FormActions>
    </Form>
  );
}`;
