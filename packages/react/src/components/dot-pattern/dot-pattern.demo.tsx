import type {Demo} from '../../demo';
import {DotPattern} from './dot-pattern';

export const demos: Demo[] = [
  {title: 'Background', description: 'Fills the nearest positioned parent.', render: () => (
    <div style={{position: 'relative', height: 200, display: 'grid', placeItems: 'center', border: '1px solid var(--rule)'}}>
      <DotPattern fade />
      <span style={{position: 'relative'}}>Content sits above</span>
    </div>
  )},
  {title: 'Accent, wider gap', render: () => (
    <div style={{position: 'relative', height: 160, border: '1px solid var(--rule)', color: 'var(--accent)'}}>
      <DotPattern gap={28} radius={1.5} />
    </div>
  )},
];
