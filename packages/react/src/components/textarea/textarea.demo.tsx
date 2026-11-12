import type {Demo} from '../../demo';
import {Textarea} from './textarea';

export const demos: Demo[] = [
  {title: 'Basic', render: () => <div style={{maxWidth: 420}}><Textarea aria-label="Notes" placeholder="What happened today?" /></div>},
];
