import type {Demo} from '../../demo';
import {BarChart} from './bar-chart';

const week = [{label: 'Mon', value: 12}, {label: 'Tue', value: 19}, {label: 'Wed', value: 9}, {label: 'Thu', value: 24}, {label: 'Fri', value: 17}, {label: 'Sat', value: 6}, {label: 'Sun', value: 4}];
const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
const channels = [{name: 'Search', values: [40, 52, 61, 70]}, {name: 'Email', values: [22, 25, 31, 38]}, {name: 'Referral', values: [10, 18, 12, 21]}];

export const demos: Demo[] = [
  {title: 'Vertical with value labels', render: () => <BarChart title="Signups per weekday" data={week} showValues />},
  {title: 'Grouped series', description: 'Series differ by fill pattern as well as colour.', render: () => <BarChart title="Visits by channel and quarter" labels={quarters} series={channels} />},
  {title: 'Stacked', render: () => <BarChart title="Total visits by quarter" labels={quarters} series={channels} stacked showValues />},
  {title: 'Horizontal', render: () => <BarChart title="Tickets by team" orientation="horizontal" showValues data={[{label: 'Platform', value: 42}, {label: 'Growth', value: 31}, {label: 'Design systems', value: 18}, {label: 'Support', value: 55}]} />},
  {title: 'Negative values', render: () => <BarChart title="Net change by month" data={[{label: 'Jan', value: 8}, {label: 'Feb', value: -5}, {label: 'Mar', value: 3}, {label: 'Apr', value: -11}]} showValues />},
  {title: 'Large numbers and empty data', render: () => (<div style={{display: 'grid', gap: 'var(--s5)'}}><BarChart title="Revenue" data={[{label: '2023', value: 1200000}, {label: '2024', value: 2750000}, {label: '2025', value: 4100000}]} height={200} /><BarChart title="Nothing yet" data={[]} /></div>)},
];
