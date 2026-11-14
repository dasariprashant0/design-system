import type {Demo} from '../../demo';
import {Field} from '../field';
import {Input} from '../input';
import {Fieldset} from './fieldset';

export const demos: Demo[] = [
  {
    title: 'Group',
    render: () => (
      <div style={{maxWidth: '360px'}}>
        <Fieldset legend="Contact">
          <Field label="Name">
            <Input />
          </Field>
          <Field label="Email">
            <Input type="email" />
          </Field>
        </Fieldset>
      </div>
    ),
  },
];
