import type {Demo} from '../../demo';
import {Switch} from './switch';

export const demos: Demo[] = [
  {title: 'Basic', render: () => <div style={{display: 'grid', gap: 'var(--s3)'}}><Switch label="Launch at login" defaultChecked /><Switch label="Weekly digest" /><Switch label="Locked" disabled /></div>},
];
