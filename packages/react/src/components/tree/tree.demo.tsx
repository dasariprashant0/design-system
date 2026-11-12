import {useState} from 'react';
import type {Demo} from '../../demo';
import {Tree, type TreeNode} from './tree';

const items: TreeNode[] = [
  {id: 'src', label: 'src', children: [
    {id: 'components', label: 'components', children: [{id: 'button', label: 'button.tsx'}, {id: 'tree', label: 'tree.tsx'}]},
    {id: 'index', label: 'index.ts'},
  ]},
  {id: 'docs', label: 'docs', children: [{id: 'readme', label: 'README.md'}]},
  {id: 'pkg', label: 'package.json'},
];

function Controlled() {
  const [v, setV] = useState('index');
  return <><Tree aria-label="Project files" items={items} value={v} onValueChange={setV} defaultExpanded={['src']} /><p className="muted">Selected: {v}</p></>;
}

export const demos: Demo[] = [
  {title: 'File tree', render: () => <Tree aria-label="Project files" items={items} defaultExpanded={['src', 'components']} />},
  {title: 'Controlled', render: () => <Controlled />},
];
