import type {ReactNode} from 'react';

/** One live example on the docs page. Export an array named `demos` from `<name>.demo.tsx`. The docs show the file's source under each demo. */
export interface Demo {
  title: string;
  description?: string;
  render: () => ReactNode;
}
