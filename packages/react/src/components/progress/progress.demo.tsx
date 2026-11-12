import type {Demo} from '../../demo';
import {Progress} from './progress';

export const demos: Demo[] = [
  {title: 'Determinate and indeterminate', render: () => (<div style={{display: 'grid', gap: 'var(--s4)', maxWidth: 420}}><Progress aria-label="Upload" value={62} /><Progress aria-label="Waiting" /></div>)},
];
