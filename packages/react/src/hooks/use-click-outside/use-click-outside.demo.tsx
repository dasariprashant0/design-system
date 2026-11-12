import type {Demo} from '../../demo';
import {useState} from 'react';
import {Button} from '../../components/button';
import {useClickOutside} from './use-click-outside';

function PopoverDemo() {
  const [open, setOpen] = useState(false);
  const ref = useClickOutside<HTMLDivElement>(() => setOpen(false), open);
  return (
    <div>
      <Button variant="line" aria-expanded={open} onClick={() => setOpen((o) => !o)}>Open panel</Button>
      {open && (
        <div ref={ref} role="group" aria-label="Panel">
          <p>Click anywhere outside this panel to close it.</p>
        </div>
      )}
    </div>
  );
}

export const demos: Demo[] = [{title: 'Close on outside click', render: () => <PopoverDemo />}];
