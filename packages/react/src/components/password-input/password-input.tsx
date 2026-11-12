'use client';
import {forwardRef, useState} from 'react';
import {Input, type InputProps} from '../input';

export type PasswordInputProps = Omit<InputProps, 'type'>;

/** An Input that can reveal its text. Set `autoComplete="current-password"` or `"new-password"`. */
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(function PasswordInput(props, ref) {
  const [shown, setShown] = useState(false);
  return (
    <div className="input-wrap">
      <Input ref={ref} type={shown ? 'text' : 'password'} {...props} />
      <button type="button" className="input-end" aria-pressed={shown} onClick={() => setShown((s) => !s)}>
        {shown ? 'Hide' : 'Show'}<span className="sr-only"> password</span>
      </button>
    </div>
  );
});
