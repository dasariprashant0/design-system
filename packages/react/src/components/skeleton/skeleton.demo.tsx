import type {Demo} from '../../demo';
import {Skeleton} from './skeleton';

export const demos: Demo[] = [{
  title: 'Lines and block',
  render: () => (
    <div style={{display: 'grid', gap: 'var(--s3)', maxWidth: 420}}>
      <Skeleton style={{width: '60%'}} />
      <Skeleton style={{width: '90%'}} />
      <Skeleton variant="hatch" />
    </div>
  ),
}];
