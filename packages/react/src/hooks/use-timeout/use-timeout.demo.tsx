import type {Demo} from '../../demo';
import {useState} from 'react';
import {Button} from '../../components/button';
import {useTimeout} from './use-timeout';

function Demo() {
  const [msg, setMsg] = useState('Idle');
  const {start, clear} = useTimeout(() => setMsg('Done after one second'), 1000);
  return <div style={{display: 'flex', gap: 'var(--s3)', alignItems: 'center'}}><Button onClick={() => { setMsg('Waiting'); start(); }}>Start</Button><Button variant="ghost" onClick={() => { clear(); setMsg('Cancelled'); }}>Cancel</Button><output aria-live="polite">{msg}</output></div>;
}

export const demos: Demo[] = [{title: 'One-second timer', render: () => <Demo />}];
