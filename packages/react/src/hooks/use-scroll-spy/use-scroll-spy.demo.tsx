import type {Demo} from '../../demo';
import {useScrollSpy} from './use-scroll-spy';

function Demo() {
  const active = useScrollSpy(['intro', 'usage'], 0);
  return <p>Active section: <output>{active ?? 'none yet'}</output>. Add elements with these ids to your page and scroll.</p>;
}

export const demos: Demo[] = [{title: 'Active section', render: () => <Demo />}];
