import type {Demo} from '../../demo';
import {Button} from '../button';
import {Tooltip, TooltipProvider} from './tooltip';

export const demos: Demo[] = [
  {
    title: 'Basic',
    render: () => (
      <TooltipProvider>
        <div style={{display: 'flex', gap: 'var(--s3)'}}>
          <Tooltip content="Saved to ~/Notes">
            <Button>Save</Button>
          </Tooltip>
          <Tooltip content="Below" side="bottom">
            <Button>Bottom</Button>
          </Tooltip>
        </div>
      </TooltipProvider>
    ),
  },
];
