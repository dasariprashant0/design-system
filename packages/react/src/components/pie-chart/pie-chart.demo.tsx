import type {Demo} from '../../demo';
import {PieChart} from './pie-chart';

const sources = [{label: 'Search', value: 46}, {label: 'Direct', value: 28}, {label: 'Email', value: 14}, {label: 'Referral', value: 8}, {label: 'Social', value: 4}];

export const demos: Demo[] = [
  {
    title: 'Pie',
    render: () => (
      <PieChart title="Traffic by source" data={sources} />
    ),
  },
  {
    title: 'Donut',
    description: 'innerRadius is a fraction of the radius.',
    render: () => (
      <PieChart title="Traffic share" data={sources} innerRadius={0.6} />
    ),
  },
  {
    title: 'Empty',
    render: () => (
      <PieChart title="Traffic by source" data={[]} />
    ),
  },
];
