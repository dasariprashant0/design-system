import type {Demo} from '../../demo';
import {Input} from './input';

export const demos: Demo[] = [
  {
    title: 'Basic',
    render: () => (
      <div style={{maxWidth: 320}}>
        <Input aria-label="Name" placeholder="Ada Lovelace" />
      </div>
    ),
  },
  {
    title: 'States',
    render: () => (
      <div style={{display: 'grid', gap: 'var(--s3)', maxWidth: 320}}>
        <Input aria-label="Invalid" invalid defaultValue="thirty" />
        <Input aria-label="Disabled" disabled defaultValue="Locked" />
        <Input aria-label="Read only" readOnly defaultValue="v0.3.0" />
        <Input aria-label="Small" size="sm" placeholder="Small" />
      </div>
    ),
  },
];
