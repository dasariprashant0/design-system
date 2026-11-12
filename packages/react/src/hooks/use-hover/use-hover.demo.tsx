import type {Demo} from '../../demo';
import {useHover} from './use-hover';

function Demo() {
  const [ref, hovered] = useHover<HTMLDivElement>();
  return <div ref={ref} style={{padding: 'var(--s5)', border: '1px solid var(--rule)', background: hovered ? 'var(--wash-2)' : 'transparent'}}>{hovered ? 'Pointer is over this box' : 'Move the pointer here'}</div>;
}

export const demos: Demo[] = [{title: 'Hover', render: () => <Demo />}];
