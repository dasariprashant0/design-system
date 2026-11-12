import type {Demo} from '../../demo';
import {Field} from '../field';
import {DatePicker} from './date-picker';

export const demos: Demo[] = [
  {title: 'In a field', render: () => <div style={{maxWidth: '260px', minHeight: '360px'}}><Field label="Due date"><DatePicker weekStartsOn={1} /></Field></div>},
];
