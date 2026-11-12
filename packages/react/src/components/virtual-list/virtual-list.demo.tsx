import type {Demo} from '../../demo';
import {VirtualList} from './virtual-list';

export const demos: Demo[] = [
  {title: '10,000 rows', description: 'Only about a dozen rows exist in the page. Tab in, then use the arrow keys, Home and End.', render: () => (
    <VirtualList aria-label="Ten thousand rows" count={10000} itemHeight={32} height={192} renderItem={(i) => <span className="virtual-list-cell">Row {i + 1}</span>} />
  )},
];
