import type {Demo} from '../../demo';
import {useReducedMotion} from './use-reduced-motion';

function MotionDemo() {
  const reduce = useReducedMotion();
  return <p>{reduce ? 'You asked for less motion: transitions are skipped.' : 'Motion is allowed.'}</p>;
}

export const demos: Demo[] = [{title: 'Motion preference', description: 'Set “reduce motion” in your system settings to see it change.', render: () => <MotionDemo />}];
