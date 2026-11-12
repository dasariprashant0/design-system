export const emailOk = (v: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v);
export type Errors<K extends string> = Partial<Record<K, string>>;

export function signIn(v: {email: string; password: string}): Errors<'email' | 'password'> {
  const e: Errors<'email' | 'password'> = {};
  if (!v.email) e.email = 'Enter your email.';
  else if (!emailOk(v.email)) e.email = 'Enter an email like name@company.com.';
  if (!v.password) e.password = 'Enter your password.';
  return e;
}

export function signUp(v: {name: string; email: string; password: string; confirm: string; terms: boolean}): Errors<'name' | 'email' | 'password' | 'confirm' | 'terms'> {
  const e = signIn(v) as Errors<'name' | 'email' | 'password' | 'confirm' | 'terms'>;
  if (!v.name.trim()) e.name = 'Enter your name.';
  if (v.password && v.password.length < 8) e.password = 'Use at least 8 characters.';
  if (v.confirm !== v.password) e.confirm = 'The passwords do not match.';
  if (!v.terms) e.terms = 'Accept the terms to continue.';
  return e;
}
