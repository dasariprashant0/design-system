import type {Demo} from '../../demo';
import {Button} from '../button';
import {Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger} from './dialog';

export const demos: Demo[] = [
  {title: 'Confirm', description: 'Use a dialog only when an action cannot be undone. Otherwise run it and offer Undo.', render: () => (
    <Dialog>
      <DialogTrigger asChild><Button>Overwrite copy</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Overwrite the remote copy?</DialogTitle><DialogDescription>The copy on this device is newer. Changes from 12 March on the other device will be lost.</DialogDescription></DialogHeader>
        <DialogFooter><DialogClose asChild><Button>Keep both</Button></DialogClose><DialogClose asChild><Button variant="solid">Overwrite</Button></DialogClose></DialogFooter>
      </DialogContent>
    </Dialog>
  )},
];
