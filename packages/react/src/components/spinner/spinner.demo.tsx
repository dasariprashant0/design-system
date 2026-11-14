import type {Demo} from '../../demo';
import {Spinner} from './spinner';

export const demos: Demo[] = [{
  title: 'Basic',
  render: () => (
    <div style={{display: 'flex', gap: 'var(--s3)', alignItems: 'center'}}>
      <Spinner />
      <span className="muted small">Syncing 42 entries</span>
    </div>
  ),
}];
