import type {Demo} from '../../demo';
import {useMounted} from './use-mounted';

function Demo() {
  const mounted = useMounted();
  return <p>{mounted ? 'Rendered in the browser.' : 'Server render.'}</p>;
}

export const demos: Demo[] = [{title: 'Client only text', render: () => <Demo />}];
