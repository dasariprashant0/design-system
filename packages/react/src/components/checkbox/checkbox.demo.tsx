import type {Demo} from '../../demo';
import {Checkbox} from './checkbox';

export const demos: Demo[] = [
  {title: 'Basic', render: () => <div style={{display: 'grid', gap: 'var(--s3)'}}><Checkbox label="Replies" defaultChecked /><Checkbox label="Mentions" /><Checkbox label="Billing (locked)" disabled /></div>},
  {title: 'Indeterminate', render: () => <Checkbox label="Select all" checked="indeterminate" onCheckedChange={() => {}} />},
];
