import type {Demo} from '../../demo';
import {AspectRatio} from './aspect-ratio';

export const demos: Demo[] = [
  {title: '16:9', render: () => <div style={{width: '320px'}}><AspectRatio ratio={16 / 9}><div style={{width: '100%', height: '100%', border: '1px solid var(--rule)', display: 'grid', placeItems: 'center'}}>16:9</div></AspectRatio></div>},
];
