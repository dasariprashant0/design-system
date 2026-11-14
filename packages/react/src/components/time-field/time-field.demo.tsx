import type {Demo} from '../../demo';
import {Field} from '../field';
import {TimeField} from './time-field';

export const demos: Demo[] = [
  {
    title: '12-hour',
    render: () => (
      <Field label="Start time">
        <TimeField defaultValue="09:30" />
      </Field>
    ),
  },
  {
    title: '24-hour in 15 minute steps',
    render: () => (
      <TimeField aria-label="Meeting time" hourCycle={24} step={15} defaultValue="14:00" />
    ),
  },
];
