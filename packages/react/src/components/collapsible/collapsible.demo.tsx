import type {Demo} from '../../demo';
import {Button} from '../button';
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from './collapsible';

export const demos: Demo[] = [
  {
    title: 'Show more',
    render: () => (
      <Collapsible>
        <CollapsibleTrigger asChild>
          <Button size="sm">Show details</Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <p>Extra detail appears here when the trigger is pressed.</p>
        </CollapsibleContent>
      </Collapsible>
    ),
  },
];
