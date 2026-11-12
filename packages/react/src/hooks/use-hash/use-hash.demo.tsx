import type {Demo} from '../../demo';
import {Button} from '../../components/button';
import {useHash} from './use-hash';

function Demo() {
  const [hash, setHash] = useHash();
  return <div style={{display: 'flex', gap: 'var(--s3)', alignItems: 'center'}}><output>#{hash || '(empty)'}</output><Button size="sm" onClick={() => setHash('use-hash')}>Set #use-hash</Button></div>;
}

export const demos: Demo[] = [{title: 'Hash state', render: () => <Demo />}];
