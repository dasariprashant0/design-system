import type {Demo} from '../../demo';
import {Text} from './text';

export const demos: Demo[] = [
  {
    title: 'Sizes and tones',
    render: () => (
      <div style={{display: 'grid', gap: 'var(--s2)'}}>
        <Text size="lg">Large</Text>
        <Text>Medium</Text>
        <Text size="sm" tone="muted">Small and muted</Text>
        <Text size="xs" tone="danger">Extra small, danger</Text>
      </div>
    ),
  },
];
