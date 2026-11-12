import type {Demo} from '../../demo';
import {ToggleGroup, ToggleGroupItem} from './toggle-group';

export const demos: Demo[] = [
  {title: 'Single', render: () => <ToggleGroup type="single" defaultValue="30" aria-label="Range"><ToggleGroupItem value="7">7 days</ToggleGroupItem><ToggleGroupItem value="30">30 days</ToggleGroupItem><ToggleGroupItem value="365">Year</ToggleGroupItem></ToggleGroup>},
];
