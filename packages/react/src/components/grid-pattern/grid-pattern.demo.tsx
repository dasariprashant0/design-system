import type {Demo} from '../../demo';
import {GridPattern} from './grid-pattern';

export const demos: Demo[] = [
  {title: 'Background', description: 'Fills the nearest positioned parent.', render: () => (
    <div style={{position: 'relative', height: 200, display: 'grid', placeItems: 'center', border: '1px solid var(--rule)'}}>
      <GridPattern fade />
      <span style={{position: 'relative'}}>Content sits above</span>
    </div>
  )},
  {title: 'Accent, larger cells', render: () => (
    <div style={{position: 'relative', height: 160, border: '1px solid var(--rule)', color: 'var(--accent)'}}>
      <GridPattern size={56} />
    </div>
  )},
];
