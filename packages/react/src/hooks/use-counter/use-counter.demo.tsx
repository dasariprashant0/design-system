import type {Demo} from '../../demo';
import {Button} from '../../components/button';
import {useCounter} from './use-counter';

function Demo() {
  const {count, increment, decrement, reset} = useCounter(1, {min: 0, max: 5});
  return <div style={{display: 'flex', gap: 'var(--s3)', alignItems: 'center'}}><Button onClick={() => decrement()} disabled={count === 0}>Less</Button><output aria-live="polite">{count}</output><Button onClick={() => increment()} disabled={count === 5}>More</Button><Button variant="ghost" onClick={reset}>Reset</Button></div>;
}

export const demos: Demo[] = [{title: 'Bounded 0 to 5', render: () => <Demo />}];
