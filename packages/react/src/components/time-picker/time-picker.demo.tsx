import type {Demo} from '../../demo';
import {Field} from '../field';
import {TimePicker} from './time-picker';

export const demos: Demo[] = [
  {
    title: 'Start time',
    render: () => (
      <div style={{maxWidth: '200px'}}>
        <Field label="Start time">
          <TimePicker defaultValue="09:30" />
        </Field>
      </div>
    ),
  },
  {
    title: 'Every 15 minutes',
    render: () => (
      <div style={{maxWidth: '200px'}}>
        <Field label="Reminder">
          <TimePicker step={900} min="08:00" max="18:00" />
        </Field>
      </div>
    ),
  },
];
