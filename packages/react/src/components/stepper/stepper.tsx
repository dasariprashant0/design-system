import {forwardRef, type HTMLAttributes, type ReactNode} from 'react';
import {cx} from '../../utils/cx';

export interface StepperStep {
  title: ReactNode;
  description?: ReactNode;
}

export interface StepperProps extends HTMLAttributes<HTMLOListElement> {
  steps: StepperStep[];
  /** Zero-based index of the current step. Earlier steps are done. */
  current: number;
}

/** A read-only step indicator. Navigation between steps is the page's job. */
export const Stepper = forwardRef<HTMLOListElement, StepperProps>(function Stepper({steps, current, className, ...rest}, ref) {
  return (
    <ol ref={ref} className={cx('steps', className)} {...rest}>
      {steps.map((s, i) => {
        const state = i < current ? 'done' : i === current ? 'current' : 'todo';
        return (
          <li key={i} className="step" data-state={state === 'done' ? 'done' : undefined} aria-current={state === 'current' ? 'step' : undefined}>
            {s.title}
            {state === 'done' && <span className="sr-only"> (completed)</span>}
            {s.description && <div className="muted small">{s.description}</div>}
          </li>
        );
      })}
    </ol>
  );
});
