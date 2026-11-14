import type {Demo} from '../../demo';
import {Label} from './label';

export const demos: Demo[] = [
  {
    title: 'Label for a control',
    render: () => (
      <div style={{display: 'grid', gap: 'var(--s2)', maxWidth: 320}}>
        <Label htmlFor="demo-label" required>Email</Label>
        <input id="demo-label" className="input" placeholder="you@example.com" />
      </div>
    ),
  },
];
