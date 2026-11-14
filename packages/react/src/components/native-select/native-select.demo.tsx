import type {Demo} from '../../demo';
import {Field} from '../field';
import {NativeSelect} from './native-select';

export const demos: Demo[] = [
  {
    title: 'In a field',
    render: () => (
      <div style={{maxWidth: '280px'}}>
        <Field label="Plan">
          <NativeSelect defaultValue="pro">
            <option value="free">Free</option>
            <option value="pro">Pro</option>
            <option value="team">Team</option>
          </NativeSelect>
        </Field>
      </div>
    ),
  },
];
