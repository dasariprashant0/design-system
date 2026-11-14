import type {Demo} from '../../demo';
import {Field} from '../field';
import {Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue} from './select';

export const demos: Demo[] = [
  {
    title: 'In a field',
    render: () => (
      <div style={{maxWidth: 320}}>
        <Field label="Sync every">
          <Select defaultValue="15">
            <SelectTrigger>
              <SelectValue placeholder="Choose" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Interval</SelectLabel>
                <SelectItem value="5">5 minutes</SelectItem>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="60">Hour</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
      </div>
    ),
  },
];
