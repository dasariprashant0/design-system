import type {Demo} from '../../demo';
import {Field} from '../field';
import {PasswordInput} from './password-input';

export const demos: Demo[] = [
  {title: 'Basic', render: () => <div style={{maxWidth: '320px'}}><Field label="Password"><PasswordInput autoComplete="current-password" /></Field></div>},
];
