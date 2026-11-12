import type {Demo} from '../../demo';
import {useState} from 'react';
import {Button} from '../../components/button';
import {usePrevious} from './use-previous';

function PreviousDemo() {
  const [value, setValue] = useState(0);
  const previous = usePrevious(value);
  return (
    <div>
      <Button variant="line" onClick={() => setValue((v) => v + 1)}>Increase</Button>
      <p>Now {value}, before {previous ?? 'nothing'}.</p>
    </div>
  );
}

export const demos: Demo[] = [{title: 'Previous value', render: () => <PreviousDemo />}];
