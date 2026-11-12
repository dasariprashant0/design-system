import type {Demo} from '../../demo';
import {Button} from '../../components/button';
import {useDisclosure} from './use-disclosure';

function DisclosureDemo() {
  const {isOpen, toggle} = useDisclosure();
  return (
    <div>
      <Button variant="line" aria-expanded={isOpen} onClick={toggle}>{isOpen ? 'Hide details' : 'Show details'}</Button>
      {isOpen && <p>Details appear here.</p>}
    </div>
  );
}

export const demos: Demo[] = [{title: 'Toggle', description: 'open, close and toggle', render: () => <DisclosureDemo />}];
