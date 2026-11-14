import type {Demo} from '../../demo';
import {Field} from '../field';
import {MultiSelect} from './multi-select';

const options = ['Ada Lovelace', 'Grace Hopper', 'Alan Turing', 'Katherine Johnson', 'Linus Torvalds'].map((n) => ({value: n.toLowerCase().replace(/\W+/g, '-'), label: n}));

export const demos: Demo[] = [
  {
    title: 'Pick several',
    render: () => (
      <div style={{maxWidth: '360px', minHeight: '280px'}}>
        <Field label="People">
          <MultiSelect
            options={options}
            placeholder="Type a name"
            defaultValue={['ada-lovelace']}
          />
        </Field>
      </div>
    ),
  },
];
