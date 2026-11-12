import type {Demo} from '../../demo';
import {RadioGroup, RadioGroupItem} from './radio-group';

export const demos: Demo[] = [
  {title: 'Basic', render: () => <RadioGroup aria-label="Plan" defaultValue="monthly"><RadioGroupItem value="monthly" label="Monthly" /><RadioGroupItem value="yearly" label="Yearly" /></RadioGroup>},
  {title: 'Horizontal', render: () => <RadioGroup aria-label="Size" orientation="horizontal" defaultValue="m"><RadioGroupItem value="s" label="S" /><RadioGroupItem value="m" label="M" /><RadioGroupItem value="l" label="L" /></RadioGroup>},
];
