import type {Demo} from '../../demo';
import {Carousel} from './carousel';

export const demos: Demo[] = [
  {
    title: 'Cards',
    render: () => (
      <Carousel aria-label="Featured">
        {['Alpha', 'Beta', 'Gamma', 'Delta'].map((n) => <div key={n} style={{display: 'grid', placeItems: 'center', height: '140px', border: '1px solid var(--rule)'}}>{n}</div>)}
      </Carousel>
    ),
  },
];
