import type {Demo} from '../../demo';
import {Heading} from './heading';

export const demos: Demo[] = [
  {title: 'Levels', render: () => <div style={{display: 'grid', gap: 'var(--s3)'}}><Heading level={1}>Display</Heading><Heading level={2}>Section</Heading><Heading level={3}>Subsection</Heading><Heading level={2} size="sm">An h2 that looks small</Heading></div>},
];
