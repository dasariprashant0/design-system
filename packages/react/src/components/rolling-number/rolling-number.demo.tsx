import {useState} from 'react';
import type {Demo} from '../../demo';
import {Button} from '../button';
import {RollingNumber} from './rolling-number';

function Counter() {
  const [n, setN] = useState(1204);
  return (
    <div style={{display: 'flex', gap: 'var(--s4)', alignItems: 'center'}}>
      <strong style={{fontSize: 'var(--display-sm)'}}><RollingNumber value={n} format={{style: 'currency', currency: 'USD', maximumFractionDigits: 0}} /></strong>
      <Button size="sm" onClick={() => setN((v) => v + 137)}>Add 137</Button>
      <Button size="sm" onClick={() => setN((v) => Math.max(0, v - 999))}>Subtract 999</Button>
    </div>
  );
}

export const demos: Demo[] = [{title: 'Currency', description: 'Digits keep their column as the number grows or shrinks.', render: () => <Counter />}];
