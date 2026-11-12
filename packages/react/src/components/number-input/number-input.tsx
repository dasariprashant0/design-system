'use client';
import {forwardRef, useImperativeHandle, useRef, type InputHTMLAttributes} from 'react';
import {cx} from '../../utils/cx';
import {useFieldControl} from '../field';

export interface NumberInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  /** Marks the control invalid (`aria-invalid`). A surrounding Field sets this from its `error`. */
  invalid?: boolean;
}

/** Native number input with step buttons. Use `min`, `max`, `step` like on any input. Works controlled or not. */
export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(function NumberInput({invalid, className, disabled, readOnly, ...rest}, ref) {
  const f = useFieldControl();
  const inner = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => inner.current!);
  const bump = (dir: 1 | -1) => {
    const el = inner.current;
    if (!el) return;
    if (dir === 1) el.stepUp(); else el.stepDown();
    el.dispatchEvent(new Event('input', {bubbles: true}));
    el.focus();
  };
  const off = disabled || readOnly;
  return (
    <div className="number-input">
      <button type="button" className="number-step" aria-label="Decrease" tabIndex={-1} disabled={off} onClick={() => bump(-1)}>−</button>
      <input ref={inner} type="number" className={cx('input number-field', className)} disabled={disabled} readOnly={readOnly} {...f} {...(invalid ? {'aria-invalid': true as const} : {})} {...rest} />
      <button type="button" className="number-step" aria-label="Increase" tabIndex={-1} disabled={off} onClick={() => bump(1)}>+</button>
    </div>
  );
});
