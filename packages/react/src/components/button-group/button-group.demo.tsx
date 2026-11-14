import type {Demo} from '../../demo';
import {Button} from '../button';
import {ButtonGroup} from './button-group';

export const demos: Demo[] = [
  {title: 'Basic', render: () => <ButtonGroup aria-label="View"><Button variant="line">Day</Button><Button variant="line">Week</Button><Button variant="line">Month</Button></ButtonGroup>},
];
