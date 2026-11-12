import type {Demo} from '../../demo';
import {CodeBlock} from './code-block';

export const demos: Demo[] = [
  {title: 'With a title', render: () => <CodeBlock title="bash" code={'npm install @monoline/react @monoline/css'} />},
];
