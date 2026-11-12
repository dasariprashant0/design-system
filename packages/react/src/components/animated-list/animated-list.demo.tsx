import type {Demo} from '../../demo';
import {AnimatedList} from './animated-list';

const row = (t: string, d: string) => (
  <div style={{display: 'grid', gap: 'var(--s1)', padding: 'var(--s3) var(--s4)', border: '1px solid var(--rule)'}}>
    <strong>{t}</strong><span style={{color: 'var(--muted)', fontSize: 'var(--text-sm)'}}>{d}</span>
  </div>
);

export const demos: Demo[] = [
  {title: 'Activity', render: () => (
    <AnimatedList style={{display: 'grid', gap: 'var(--s2)', maxWidth: '24rem'}}>
      {row('Build passed', 'main, 2 minutes ago')}
      {row('Review requested', 'Docs update, 5 minutes ago')}
      {row('Deploy finished', 'Production, 9 minutes ago')}
    </AnimatedList>
  )},
];
