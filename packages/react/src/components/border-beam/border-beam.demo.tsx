import type {Demo} from '../../demo';
import {BorderBeam} from './border-beam';

export const demos: Demo[] = [
  {
    title: 'Default',
    render: () => (
      <BorderBeam style={{padding: 'var(--s6)', maxWidth: '24rem'}}>
        <p style={{margin: 0}}>A light travels the edge of this box.</p>
      </BorderBeam>
    ),
  },
  {
    title: 'Slow',
    render: () => (
      <BorderBeam duration={14} style={{padding: 'var(--s6)', maxWidth: '24rem'}}>
        <p style={{margin: 0}}>Fourteen seconds a lap.</p>
      </BorderBeam>
    ),
  },
];
