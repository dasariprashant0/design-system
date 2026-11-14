import type {Demo} from '../../demo';
import {Field} from '../field';
import {Mentions, type MentionOption} from './mentions';

const people: MentionOption[] = [
  {value: 'ada', label: 'Ada Lovelace'},
  {value: 'grace', label: 'Grace Hopper'},
  {value: 'alan', label: 'Alan Turing'},
  {value: 'linus', label: 'Linus Torvalds', disabled: true},
];

const load = (q: string): Promise<MentionOption[]> => new Promise((done) => setTimeout(() => done(people.filter((p) => p.label.toLowerCase().includes(q.toLowerCase()))), 300));

export const demos: Demo[] = [
  {
    title: 'Static options',
    description: 'Type @ at the start of a word.',
    render: () => (
      <div style={{maxWidth: '360px', minHeight: '220px'}}>
        <Field label="Comment">
          <Mentions options={people} rows={3} />
        </Field>
      </div>
    ),
  },
  {
    title: 'Loaded as you type',
    render: () => (
      <div style={{maxWidth: '360px', minHeight: '220px'}}>
        <Field label="Reply">
          <Mentions onSearch={load} triggers={['@', '#']} rows={3} />
        </Field>
      </div>
    ),
  },
];
