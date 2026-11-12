import type {Demo} from '../../demo';
import {IconButton} from './icon-button';

const Plus = () => <svg aria-hidden="true" viewBox="0 0 12 12" width="12" height="12"><path d="M6 1v10M1 6h10" stroke="currentColor" fill="none" /></svg>;

export const demos: Demo[] = [
  {title: 'Variants', render: () => <div style={{display: 'flex', gap: 'var(--s3)'}}><IconButton aria-label="Add"><Plus /></IconButton><IconButton variant="solid" aria-label="Add item"><Plus /></IconButton><IconButton variant="ghost" size="sm" aria-label="Add row"><Plus /></IconButton></div>},
];
