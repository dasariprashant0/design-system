import type {Demo} from '../../demo';
import {Toggle} from './toggle';

export const demos: Demo[] = [{title: 'Basic', render: () => <div style={{display: 'flex', gap: 'var(--s3)'}}><Toggle>Bold</Toggle><Toggle defaultPressed>Italic</Toggle><Toggle disabled>Locked</Toggle></div>}];
