import type {Demo} from '../../demo';
import {useState} from 'react';
import {Button} from '../../components/button';
import {useFocusTrap} from './use-focus-trap';

function TrapDemo() {
  const [open, setOpen] = useState(false);
  const ref = useFocusTrap<HTMLDivElement>(open);
  return (
    <div>
      <Button variant="line" onClick={() => setOpen(true)}>Open trapped panel</Button>
      {open && (
        <div ref={ref} role="dialog" aria-label="Trapped panel">
          <p>Tab stays inside this panel.</p>
          <Button variant="line" onClick={() => setOpen(false)}>Close</Button>
          <Button variant="ghost">Second action</Button>
        </div>
      )}
    </div>
  );
}

export const demos: Demo[] = [{title: 'Focus trap', description: 'Focus returns to the opening button on close.', render: () => <TrapDemo />}];
