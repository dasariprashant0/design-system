import type {Demo} from '../../demo';
import {Badge} from './badge';

export const demos: Demo[] = [
  {
    title: 'Variants',
    render: () => (
      <div style={{display: 'flex', gap: 'var(--s3)', flexWrap: 'wrap'}}>
        <Badge>draft</Badge>
        <Badge variant="solid">12 days</Badge>
        <Badge variant="accent">new</Badge>
      </div>
    ),
  },
];
