import type {Demo} from '../../demo';
import {LineChart} from './line-chart';

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const demos: Demo[] = [
  {
    title: 'Single series with points',
    render: () => (
      <LineChart
        title="Response time"
        showPoints
        data={[{label: 'Mon', value: 120}, {label: 'Tue', value: 98}, {label: 'Wed', value: 143}, {label: 'Thu', value: 110}, {label: 'Fri', value: 87}]}
      />
    ),
  },
  {
    title: 'Multiple series',
    description: 'Series differ by dash pattern and marker shape as well as colour.',
    render: () => (
      <LineChart
        title="Visits and signups"
        labels={days}
        showPoints
        series={[{name: 'Visits', values: [30, 42, 38, 55, 61, 28, 22]}, {name: 'Signups', values: [4, 7, 6, 11, 14, 5, 3]}, {name: 'Trials', values: [2, 3, 3, 6, 8, 2, 1]}]}
      />
    ),
  },
  {
    title: 'Stepped',
    render: () => (
      <LineChart
        title="Plan price over time"
        curve="step"
        data={[{label: '2021', value: 9}, {label: '2022', value: 9}, {label: '2023', value: 12}, {label: '2024', value: 15}, {label: '2025', value: 15}]}
      />
    ),
  },
  {
    title: 'Single point and empty',
    render: () => (
      <div style={{display: 'grid', gap: 'var(--s5)'}}>
        <LineChart title="One reading" height={160} data={[{label: 'Now', value: 7}]} />
        <LineChart title="No readings" data={[]} />
      </div>
    ),
  },
];
