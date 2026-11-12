import type {Demo} from '../../demo';
import {OrbitingCircles} from './orbiting-circles';

const dot = (t: string) => <span style={{display: 'grid', placeItems: 'center', width: 'var(--s7)', height: 'var(--s7)', border: '1px solid var(--foreground)', background: 'var(--background)', fontSize: 'var(--text-xs)'}}>{t}</span>;

export const demos: Demo[] = [
  {title: 'Two orbits', description: 'Decorative only: hidden from assistive tech.', render: () => (
    <div style={{display: 'grid', placeItems: 'center'}}>
      <OrbitingCircles radius={96} center={dot('M')}>{dot('A')}{dot('B')}{dot('C')}</OrbitingCircles>
    </div>
  )},
  {title: 'Reverse, slow', render: () => (
    <div style={{display: 'grid', placeItems: 'center'}}>
      <OrbitingCircles radius={64} duration={40} reverse>{dot('1')}{dot('2')}</OrbitingCircles>
    </div>
  )},
];
