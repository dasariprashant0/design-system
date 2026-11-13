import type {Demo} from '../../demo';
import {SortableList, type SortableItem} from './sortable-list';

const items: SortableItem[] = ['Write the brief', 'Draft the spec', 'Review with design', 'Build', 'Ship'].map((t) => ({id: t, label: t}));

export const demos: Demo[] = [
  {title: 'Vertical', description: 'Tab to a handle, press Space, move with the arrow keys, press Space to drop. Drag with a pointer works too.', render: () => <div style={{maxWidth: '360px'}}><SortableList aria-label="Tasks" defaultValue={items} /></div>},
  {title: 'Horizontal', render: () => <SortableList aria-label="Steps" orientation="horizontal" defaultValue={items.slice(0, 3)} />},
];
