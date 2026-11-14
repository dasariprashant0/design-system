import type {Demo} from '../../demo';
import {Field} from '../field';
import {Combobox} from './combobox';

const options = ['Ada Lovelace', 'Grace Hopper', 'Alan Turing', 'Katherine Johnson', 'Linus Torvalds'].map((n) => ({value: n.toLowerCase().replace(/\W+/g, '-'), label: n}));

export const demos: Demo[] = [
  {
    title: 'Search and pick',
    render: () => (
      <div style={{maxWidth: '320px', minHeight: '260px'}}>
        <Field label="Person">
          <Combobox options={options} placeholder="Type a name" />
        </Field>
      </div>
    ),
  },
];
