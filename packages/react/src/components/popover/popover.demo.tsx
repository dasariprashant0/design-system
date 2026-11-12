import type {Demo} from '../../demo';
import {Button} from '../button';
import {Popover, PopoverContent, PopoverTrigger} from './popover';

export const demos: Demo[] = [
  {title: 'Basic', render: () => (<Popover><PopoverTrigger asChild><Button>Details</Button></PopoverTrigger><PopoverContent aria-label="Entry details"><p style={{margin: 0}}>Logged today at 14:20. 3 files changed.</p></PopoverContent></Popover>)},
];
