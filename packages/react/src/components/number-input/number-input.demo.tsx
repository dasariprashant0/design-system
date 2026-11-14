import type {Demo} from '../../demo';
import {Field} from '../field';
import {NumberInput} from './number-input';

export const demos: Demo[] = [
  {
    title: 'Quantity',
    render: () => (
      <div style={{maxWidth: '200px'}}>
        <Field label="Quantity">
          <NumberInput defaultValue={1} min={0} max={10} />
        </Field>
      </div>
    ),
  },
];
