import type {Demo} from '../../demo';
import {useState} from 'react';
import {useWindowEvent} from './use-window-event';

function Demo() {
  const [key, setKey] = useState('none');
  useWindowEvent('keydown', (e) => setKey(e.key));
  return <p>Last key pressed: <kbd className="kbd">{key}</kbd></p>;
}

export const demos: Demo[] = [{title: 'Last key', render: () => <Demo />}];
