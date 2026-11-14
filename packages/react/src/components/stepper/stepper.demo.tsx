import type {Demo} from '../../demo';
import {Stepper} from './stepper';

export const demos: Demo[] = [
  {
    title: 'Checkout',
    render: () => (
      <Stepper
        aria-label="Checkout"
        current={1}
        steps={[{title: 'Account'}, {title: 'Plan', description: 'Pick one'}, {title: 'Payment'}]}
      />
    ),
  },
];
