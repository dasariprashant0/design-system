import type {Demo} from '../../demo';
import {Spotlight} from './spotlight';

export const demos: Demo[] = [
  {title: 'Card', description: 'Move the pointer over it.', render: () => (
    <Spotlight style={{padding: 'var(--s7)', border: '1px solid var(--rule)', maxWidth: '28rem'}}>
      <h3 style={{margin: 0, fontWeight: 500}}>Hover here</h3>
      <p style={{margin: 'var(--s2) 0 0', color: 'var(--muted)'}}>A soft light follows the pointer. Keyboard and touch see a plain surface.</p>
    </Spotlight>
  )},
  {
    title: 'Larger glow',
    render: () => (
      <Spotlight size={400} style={{padding: 'var(--s7)', border: '1px solid var(--rule)', maxWidth: '28rem'}}>Wide glow</Spotlight>
    ),
  },
];
