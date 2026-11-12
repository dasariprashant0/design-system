import type {Demo} from '../../demo';
import {Field} from '../field';
import {TagsInput} from './tags-input';

export const demos: Demo[] = [
  {title: 'Add keywords', description: 'Press Enter or comma to add. Backspace removes the last one.', render: () => <div style={{maxWidth: '360px'}}><Field label="Keywords"><TagsInput placeholder="Add a keyword" defaultValue={['design', 'css']} /></Field></div>},
];
