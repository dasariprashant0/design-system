import type {Demo} from '../../demo';
import {useState} from 'react';
import {Button} from '../../components/button';
import {useDocumentTitle} from './use-document-title';

function Demo() {
  const [n, setN] = useState(0);
  useDocumentTitle(n ? `(${n}) Monoline docs` : 'Monoline docs');
  return <Button onClick={() => setN(n + 1)}>Change the tab title ({n})</Button>;
}

export const demos: Demo[] = [{title: 'Tab title', render: () => <Demo />}];
