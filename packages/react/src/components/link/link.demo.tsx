import type {Demo} from '../../demo';
import {Link} from './link';

export const demos: Demo[] = [
  {
    title: 'Internal and external',
    render: () => (
      <p>Read the <Link href="#button">button docs</Link> or visit <Link href="https://github.com" external>GitHub</Link>.</p>
    ),
  },
];
