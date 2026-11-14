import type {Demo} from '../../demo';
import {Marquee} from './marquee';

export const demos: Demo[] = [
  {
    title: 'Names',
    render: () => (
      <Marquee duration={20}>
        {['Acme', 'Globex', 'Initech', 'Umbrella', 'Hooli'].map((n) => <span key={n} style={{padding: '0 var(--s5)', fontFamily: 'var(--font-display)'}}>{n}</span>)}
      </Marquee>
    ),
  },
];
