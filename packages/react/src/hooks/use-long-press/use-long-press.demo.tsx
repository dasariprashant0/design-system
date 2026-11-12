import type {Demo} from '../../demo';
import {useState} from 'react';
import {Button} from '../../components/button';
import {useLongPress} from './use-long-press';

function Demo() {
  const [n, setN] = useState(0);
  const press = useLongPress(() => setN((v) => v + 1), {delay: 600});
  return <div style={{display: 'flex', gap: 'var(--s3)', alignItems: 'center'}}><Button {...press} onClick={() => setN((v) => v + 1)}>Hold or click</Button><output aria-live="polite">{n} presses</output></div>;
}

export const demos: Demo[] = [{title: 'Hold for 0.6 seconds', description: 'A normal click does the same thing, so the hold is optional.', render: () => <Demo />}];
