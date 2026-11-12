import type {Demo} from '../../demo';
import {Button} from '../../components/button';
import {useControllableState} from './use-controllable-state';

interface CounterProps {
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
}

function Counter({value, defaultValue = 0, onValueChange}: CounterProps) {
  const [count, setCount] = useControllableState({value, defaultValue, onChange: onValueChange});
  return (
    <div>
      <Button variant="line" aria-label="Decrease" onClick={() => setCount(count - 1)}>−</Button>{' '}
      <output>{count}</output>{' '}
      <Button variant="line" aria-label="Increase" onClick={() => setCount(count + 1)}>+</Button>
    </div>
  );
}

export const demos: Demo[] = [
  {title: 'Uncontrolled', description: 'Starts at defaultValue and keeps its own state.', render: () => <Counter defaultValue={2} />},
  {
    title: 'Controlled',
    description: 'The parent owns the value and rounds it to the nearest 5 before storing it.',
    render: () => <ControlledCounter />,
  },
];

function ControlledCounter() {
  const [value, setValue] = useControllableState({defaultValue: 0});
  return <Counter value={value} onValueChange={(next) => setValue(Math.round(next / 5) * 5)} />;
}
