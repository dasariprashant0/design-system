import type {Demo} from '../../demo';
import {Tag} from '../tag';
import {OverflowList} from './overflow-list';

const names = ['Design', 'Engineering', 'Marketing', 'Support', 'Finance', 'Legal', 'People', 'Research'];

export const demos: Demo[] = [
  {title: 'Tags in a narrow box', description: 'Resize the window: items move in and out of the menu.', render: () => (
    <div style={{maxWidth: '320px', resize: 'horizontal', overflow: 'auto', paddingBlock: 'var(--s2)'}}>
      <OverflowList items={names.map((n) => ({id: n, label: <Tag>{n}</Tag>}))} />
    </div>
  )},
];
