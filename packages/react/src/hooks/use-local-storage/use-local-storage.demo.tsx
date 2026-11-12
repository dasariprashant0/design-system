import type {Demo} from '../../demo';
import {Button} from '../../components/button';
import {useLocalStorage} from './use-local-storage';

function CountDemo() {
  const [count, setCount] = useLocalStorage('monoline-demo-count', 0);
  return (
    <div>
      <Button variant="line" onClick={() => setCount((n) => n + 1)}>Count is {count}</Button>
      <p>Saved in this browser. Open this page in another tab and click there to see it sync.</p>
    </div>
  );
}

export const demos: Demo[] = [{title: 'Persisted counter', render: () => <CountDemo />}];
