import type {Demo} from '../../demo';
import {Input} from '../input';
import {Field} from './field';

export const demos: Demo[] = [
  {title: 'Label and hint', render: () => <div style={{maxWidth: 360}}><Field label="Email" hint="We never share it." required><Input type="email" placeholder="you@example.com" /></Field></div>},
  {title: 'With an error', description: 'Say what happened, then what to do.', render: () => <div style={{maxWidth: 360}}><Field label="Days" error="Enter a number, such as 30."><Input defaultValue="thirty" /></Field></div>},
];
