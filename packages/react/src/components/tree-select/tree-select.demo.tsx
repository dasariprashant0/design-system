import type {Demo} from '../../demo';
import {Field} from '../field';
import type {TreeNode} from '../tree';
import {TreeSelect} from './tree-select';

const items: TreeNode[] = [
  {id: 'eng', label: 'Engineering', children: [
    {id: 'web', label: 'Web'},
    {id: 'platform', label: 'Platform', children: [{id: 'infra', label: 'Infrastructure'}, {id: 'data', label: 'Data'}]},
  ]},
  {id: 'design', label: 'Design', children: [{id: 'brand', label: 'Brand'}, {id: 'product', label: 'Product design'}]},
  {id: 'ops', label: 'Operations'},
];

export const demos: Demo[] = [
  {title: 'Single', description: 'Type to search. ArrowRight and ArrowLeft open and close branches.', render: () => <div style={{maxWidth: '320px', minHeight: '300px'}}><Field label="Team"><TreeSelect items={items} placeholder="Choose a team" /></Field></div>},
  {title: 'Multiple', render: () => <div style={{maxWidth: '320px', minHeight: '300px'}}><Field label="Teams"><TreeSelect multiple items={items} placeholder="Choose teams" defaultValue={['web']} /></Field></div>},
];
