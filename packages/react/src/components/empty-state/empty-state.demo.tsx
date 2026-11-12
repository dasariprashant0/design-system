import type {Demo} from '../../demo';
import {Button} from '../button';
import {EmptyState} from './empty-state';

export const demos: Demo[] = [
  {title: 'With an action', render: () => <EmptyState title="No projects yet" description="Projects you create show up here."><Button variant="solid">New project</Button></EmptyState>},
];
