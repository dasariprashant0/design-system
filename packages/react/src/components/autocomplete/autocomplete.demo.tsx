import type {Demo} from '../../demo';
import {Field} from '../field';
import {Autocomplete} from './autocomplete';

const cities = ['Amsterdam', 'Berlin', 'Bangalore', 'Boston', 'Lisbon', 'London', 'Lagos'];

export const demos: Demo[] = [
  {
    title: 'Free text with suggestions',
    description: 'Pick a city or type any other.',
    render: () => (
      <div style={{maxWidth: '320px', minHeight: '220px'}}>
        <Field label="City">
          <Autocomplete suggestions={cities} placeholder="Start typing" />
        </Field>
      </div>
    ),
  },
];
