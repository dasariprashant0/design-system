'use client';
import {useRef} from 'react';
import type {Demo} from '../../demo';
import {Button} from '../button';
import {Confetti, type ConfettiHandle} from './confetti';

function Fire() {
  const ref = useRef<ConfettiHandle>(null);
  return (
    <>
      <Confetti ref={ref} />
      <Button variant="line" onClick={() => ref.current?.fire()}>Celebrate</Button>
    </>
  );
}

export const demos: Demo[] = [
  {
    title: 'Fire from a ref',
    description: 'Does nothing when the system asks for reduced motion.',
    render: () => (
      <Fire />
    ),
  },
];
