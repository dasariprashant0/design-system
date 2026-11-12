import type {Demo} from '../../demo';
import {Kbd} from './kbd';

export const demos: Demo[] = [
  {title: 'Shortcut', render: () => <p>Press <Kbd>⌘</Kbd> <Kbd>K</Kbd> to search.</p>},
];
