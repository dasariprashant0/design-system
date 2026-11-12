import type {Demo} from '../../demo';
import {useState} from 'react';
import {Button} from '../../components/button';
import {useInterval} from './use-interval';

function IntervalDemo() {
  const [running, setRunning] = useState(true);
  const [seconds, setSeconds] = useState(0);
  useInterval(() => setSeconds((s) => s + 1), running ? 1000 : null);
  return (
    <div>
      <p>Elapsed: {seconds} s</p>
      <Button variant="line" onClick={() => setRunning((r) => !r)}>{running ? 'Pause' : 'Resume'}</Button>
    </div>
  );
}

export const demos: Demo[] = [{title: 'Timer', description: 'Pass null as the delay to pause.', render: () => <IntervalDemo />}];
