import {createContext, forwardRef, useContext, useId, type HTMLAttributes, type ReactNode} from 'react';
import {cx} from '../../utils/cx';
import {Label} from '../label';

interface FieldContextValue {
  id: string;
  invalid: boolean;
  required: boolean;
  describedBy: string | undefined;
}
const FieldContext = createContext<FieldContextValue | null>(null);

/**
 * Props a form control should spread to join its surrounding Field: id, aria-describedby, aria-invalid, required.
 * Outside a Field it returns an empty object, so controls work alone too.
 */
export function useFieldControl(): {id?: string; 'aria-describedby'?: string; 'aria-invalid'?: true; 'data-invalid'?: ''; required?: true} {
  const ctx = useContext(FieldContext);
  if (!ctx) return {};
  return {
    id: ctx.id,
    'aria-describedby': ctx.describedBy,
    'aria-invalid': ctx.invalid ? true : undefined,
    'data-invalid': ctx.invalid ? '' : undefined,
    required: ctx.required ? true : undefined,
  };
}

/** Attributes for a control marked invalid with its own `invalid` prop: `aria-invalid` for assistive tech, `data-invalid` for styling. */
export function invalidAttrs(invalid?: boolean): {'aria-invalid'?: true; 'data-invalid'?: ''} {
  return invalid ? {'aria-invalid': true, 'data-invalid': ''} : {};
}

export interface FieldProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** The visible label of the control. Required so every control has a name. */
  label: ReactNode;
  /** Help text shown under the control. */
  hint?: ReactNode;
  /** Error message. Its presence marks the control invalid and it is announced politely. */
  error?: ReactNode;
  /** Marks the control as required: adds a required marker to the label and sets `required` on the control. Default false. */
  required?: boolean;
  /** The control: Input, Textarea, Select trigger, etc. */
  children: ReactNode;
}

/**
 * Wires a label, a control, a hint and an error together with the right ids and ARIA, so you never do it by hand.
 * @example <Field label="Email" hint="We never share it." error={err}><Input type="email" /></Field>
 */
export const Field = forwardRef<HTMLDivElement, FieldProps>(function Field({label, hint, error, required = false, className, children, ...rest}, ref) {
  const base = useId();
  const hintId = hint ? `${base}-hint` : undefined;
  const errorId = error ? `${base}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;
  return (
    <FieldContext.Provider value={{id: `${base}-control`, invalid: Boolean(error), required, describedBy}}>
      <div ref={ref} className={cx('field', className)} {...rest}>
        <Label htmlFor={`${base}-control`} required={required}>{label}</Label>
        {children}
        {hint && <span id={hintId} className="field-hint">{hint}</span>}
        {error && <span id={errorId} className="field-error" role="alert">{error}</span>}
      </div>
    </FieldContext.Provider>
  );
});
