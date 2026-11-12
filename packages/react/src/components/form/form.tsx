'use client';
import {forwardRef, useCallback, useRef, type FormEvent, type FormHTMLAttributes, type HTMLAttributes, type ReactNode} from 'react';
import {cx} from '../../utils/cx';

export interface FormError {
  /** The `name` of the invalid control. The summary link focuses it. */
  name: string;
  message: ReactNode;
}

export interface FormProps extends Omit<FormHTMLAttributes<HTMLFormElement>, 'onSubmit'> {
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
  /** Call `event.preventDefault()` before `onSubmit`, for forms handled in JS. Off by default so native posts still work. */
  preventDefault?: boolean;
  /** Errors to list in a summary at the top of the form. Also pass each message to its `Field` as `error`. */
  errors?: FormError[];
  /** Heading of the summary. Default "Fix these to continue". */
  errorsTitle?: ReactNode;
}

/**
 * A `<form>` with an optional error summary and a submit helper.
 * The summary is a `role="alert"` region at the top; each item links to its control and moves focus there.
 * Build the fields with `Field` and end the form with `FormActions`.
 */
export const Form = forwardRef<HTMLFormElement, FormProps>(function Form({onSubmit, preventDefault, errors, errorsTitle = 'Fix these to continue', className, children, ...rest}, ref) {
  const inner = useRef<HTMLFormElement | null>(null);
  const setRef = useCallback((el: HTMLFormElement | null) => {
    inner.current = el;
    if (typeof ref === 'function') ref(el);
    else if (ref) ref.current = el;
  }, [ref]);
  const focusField = (name: string) => {
    const el = inner.current?.elements.namedItem(name);
    if (el instanceof HTMLElement) el.focus();
  };
  return (
    <form
      ref={setRef}
      className={cx('form', className)}
      onSubmit={(e) => { if (preventDefault) e.preventDefault(); onSubmit?.(e); }}
      {...rest}
    >
      {errors && errors.length > 0 && (
        <div className="form-errors" role="alert">
          <p className="form-errors-title">{errorsTitle}</p>
          <ul>
            {errors.map((err) => (
              <li key={err.name}>
                <a href={`#${err.name}`} onClick={(e) => { e.preventDefault(); focusField(err.name); }}>{err.message}</a>
              </li>
            ))}
          </ul>
        </div>
      )}
      {children}
    </form>
  );
});

/** The footer row with the submit and cancel buttons. One solid Button per form. */
export const FormActions = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function FormActions({className, ...rest}, ref) {
  return <div ref={ref} className={cx('form-actions', className)} {...rest} />;
});
