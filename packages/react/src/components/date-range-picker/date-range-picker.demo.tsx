import type {Demo} from '../../demo';
import {Field} from '../field';
import {DateRangePicker} from './date-range-picker';

export const demos: Demo[] = [
  {
    title: 'In a field',
    render: () => (
      <div style={{maxWidth: '320px', minHeight: '440px'}}>
        <Field label="Stay">
          <DateRangePicker weekStartsOn={1} />
        </Field>
      </div>
    ),
  },
];
