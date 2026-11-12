import type {Demo} from '../../demo';
import {BlockEmptyPage} from './block-empty-page';
import {Button} from '../button';

export const demos: Demo[] = [
  {title: 'Not found', render: () => <BlockEmptyPage code="404" title="Page not found" description="The address may be wrong, or the page moved." actions={<><Button variant="solid">Go home</Button><Button>Contact support</Button></>} />},
  {title: 'Nothing yet', render: () => <BlockEmptyPage title="No projects yet" description="Create a project to see it here." actions={<Button variant="solid">New project</Button>} />},
];
