import type {Demo} from '../../demo';
import {useState} from 'react';
import {Field} from '../field';
import {DatePicker} from './date-picker';

function Clearable() {
  const [d, setD] = useState<Date | null>(new Date());
  return <div style={{maxWidth: '260px', minHeight: '400px'}}><Field label="Filter by date"><DatePicker clearable value={d} onValueChange={setD} /></Field></div>;
}

export const demos: Demo[] = [
  {
    title: 'In a field',
    render: () => (
      <div style={{maxWidth: '260px', minHeight: '360px'}}>
        <Field label="Due date">
          <DatePicker weekStartsOn={1} />
        </Field>
      </div>
    ),
  },
  {
    title: 'Clearable',
    description: 'clearable adds a "Clear date" button in the popover; onValueChange receives null.',
    render: () => (
      <Clearable />
    ),
  },
];
