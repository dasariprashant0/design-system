import type {Demo} from '../../demo';
import {Avatar} from './avatar';

export const demos: Demo[] = [
  {title: 'Fallback initials', render: () => <div style={{display: 'flex', gap: 'var(--s3)', alignItems: 'center'}}><Avatar name="Ada Lovelace" /><Avatar name="Grace Hopper" variant="line" /><Avatar name="Alan Turing" size="lg" /></div>},
];
