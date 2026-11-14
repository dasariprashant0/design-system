import type {Demo} from '../../demo';
import {Sparkline} from './sparkline';

export const demos: Demo[] = [
  {
    title: 'Inline',
    render: () => (
      <p>Signups <Sparkline title="Signups, last 10 days" data={[3, 5, 4, 8, 6, 9, 12, 10, 14, 13]} /> up 18% this week.</p>
    ),
  },
  {
    title: 'With area, wider',
    render: () => (
      <Sparkline
        title="Latency, last hour"
        data={[120, 118, 130, 125, 160, 142, 138, 150]}
        area
        width={160}
        height={32}
      />
    ),
  },
  {
    title: 'Flat and empty',
    render: () => (
      <p>
        <Sparkline title="Flat" data={[5, 5, 5, 5]} />
        <Sparkline title="Nothing" data={[]} />
      </p>
    ),
  },
];
