import type {Demo} from '../../demo';
import {Alert} from './alert';

export const demos: Demo[] = [
  {title: 'Tones', render: () => (<div style={{display: 'grid', gap: 'var(--s3)'}}><Alert title="Synced.">42 entries up to date as of 14:20.</Alert><Alert tone="success" title="Saved.">Your changes are live.</Alert><Alert tone="warning" title="Conflict.">Two devices edited 12 March. Pick which copy to keep.</Alert><Alert tone="danger" title="Can't save.">The folder is read-only. Pick another folder.</Alert></div>)},
];
