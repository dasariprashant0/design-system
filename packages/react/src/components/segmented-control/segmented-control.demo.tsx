import type {Demo} from '../../demo';
import {SegmentedControl} from './segmented-control';

export const demos: Demo[] = [
  {title: 'Basic', render: () => <SegmentedControl aria-label="Chart range" options={[{value: 'day', label: 'Day'}, {value: 'week', label: 'Week'}, {value: 'month', label: 'Month'}]} defaultValue="week" />},
];
