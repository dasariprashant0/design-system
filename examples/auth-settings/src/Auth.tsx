import {useState} from 'react';
import {Alert, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Checkbox, Field, Form, FormActions, Input, Link, PasswordInput, Text} from '@monoline/react';
import {signIn, signUp, type Errors} from './validate';

const list = (e: Errors<string>) => Object.entries(e).map(([name, message]) => ({name, message}));

export function SignIn({onDone, go}: {onDone: () => void; go: (h: string) => void}) {
  const [v, setV] = useState({email: '', password: ''});
  const [errors, setErrors] = useState<Errors<'email' | 'password'>>({});
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  const submit = () => {
    const e = signIn(v);
    setErrors(e);
    setFailed(false);
    if (Object.keys(e).length) return;
    setBusy(true);
    setTimeout(() => { setBusy(false); v.password === 'wrong-password' ? setFailed(true) : onDone(); }, 600);
  };

  return (
    <Card className="auth-card">
      <CardHeader><CardTitle>Sign in</CardTitle><CardDescription>Welcome back. Use any email and password.</CardDescription></CardHeader>
      <CardContent>
        {failed && <Alert tone="danger" title="Wrong email or password">Check them and try again.</Alert>}
        <Form preventDefault noValidate onSubmit={submit} errors={list(errors)}>
          <Field label="Email" error={errors.email}>
            <Input name="email" type="email" autoComplete="email" value={v.email} onChange={(e) => setV({...v, email: e.target.value})} />
          </Field>
          <Field label="Password" error={errors.password}>
            <PasswordInput name="password" autoComplete="current-password" value={v.password} onChange={(e) => setV({...v, password: e.target.value})} />
          </Field>
          <FormActions><Button type="submit" variant="solid" loading={busy}>Sign in</Button></FormActions>
        </Form>
        <Text size="sm">No account? <Link href="#signup" onClick={() => go('signup')}>Create one</Link></Text>
      </CardContent>
    </Card>
  );
}

export function SignUp({onDone, go}: {onDone: () => void; go: (h: string) => void}) {
  const [v, setV] = useState({name: '', email: '', password: '', confirm: '', terms: false});
  const [errors, setErrors] = useState<Errors<'name' | 'email' | 'password' | 'confirm' | 'terms'>>({});
  const set = (k: keyof typeof v) => (e: {target: {value: string}}) => setV({...v, [k]: e.target.value});

  return (
    <Card className="auth-card">
      <CardHeader><CardTitle>Create your account</CardTitle><CardDescription>Free for 14 days. No card needed.</CardDescription></CardHeader>
      <CardContent>
        <Form preventDefault noValidate errors={list(errors)} onSubmit={() => { const e = signUp(v); setErrors(e); if (!Object.keys(e).length) onDone(); }}>
          <Field label="Name" error={errors.name}><Input name="name" autoComplete="name" value={v.name} onChange={set('name')} /></Field>
          <Field label="Email" error={errors.email}><Input name="email" type="email" autoComplete="email" value={v.email} onChange={set('email')} /></Field>
          <Field label="Password" hint="At least 8 characters." error={errors.password}><PasswordInput name="password" autoComplete="new-password" value={v.password} onChange={set('password')} /></Field>
          <Field label="Confirm password" error={errors.confirm}><PasswordInput name="confirm" autoComplete="new-password" value={v.confirm} onChange={set('confirm')} /></Field>
          <Field label="Terms" error={errors.terms}>
            <Checkbox name="terms" label="I accept the terms of service" checked={v.terms} onCheckedChange={(c) => setV({...v, terms: c === true})} />
          </Field>
          <FormActions><Button type="submit" variant="solid">Create account</Button></FormActions>
        </Form>
        <Text size="sm">Already registered? <Link href="#signin" onClick={() => go('signin')}>Sign in</Link></Text>
      </CardContent>
    </Card>
  );
}
