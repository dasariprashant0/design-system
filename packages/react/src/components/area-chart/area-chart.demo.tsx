import type {Demo} from '../../demo';
import {AreaChart} from './area-chart';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

export const demos: Demo[] = [
  {title: 'Single series', render: () => <AreaChart title="Active users" labels={months} series={[{name: 'Users', values: [120, 180, 150, 240, 310, 290]}]} />},
  {title: 'Stacked', render: () => <AreaChart title="Traffic by source" stacked labels={months} series={[{name: 'Search', values: [40, 55, 48, 70, 90, 85]}, {name: 'Email', values: [20, 25, 30, 32, 40, 44]}, {name: 'Social', values: [10, 12, 9, 18, 22, 20]}]} />},
  {title: 'Stepped', render: () => <AreaChart title="Seats in use" curve="step" data={[{label: 'W1', value: 10}, {label: 'W2', value: 14}, {label: 'W3', value: 14}, {label: 'W4', value: 22}]} />},
];
