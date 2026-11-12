import type {Demo} from '../../demo';
import {Button} from '../button';
import {ButtonGroup} from './button-group';

export const demos: Demo[] = [
  {title: 'Basic', render: () => <ButtonGroup aria-label="View"><Button>Day</Button><Button>Week</Button><Button>Month</Button></ButtonGroup>},
];
