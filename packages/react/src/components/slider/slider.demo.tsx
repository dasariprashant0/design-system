import type {Demo} from '../../demo';
import {Slider} from './slider';

export const demos: Demo[] = [
  {
    title: 'Single and range',
    render: () => (
      <div style={{display: 'grid', gap: 'var(--s5)', maxWidth: 420}}>
        <Slider aria-label="Volume" defaultValue={60} />
        <Slider aria-label="Price" defaultValue={[20, 70]} />
      </div>
    ),
  },
];
