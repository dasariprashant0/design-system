import type {Demo} from '../../demo';
import {CodeBlock} from './code-block';

const tsx = `import {Button} from '@monoline/react';

export function Save() {
  // One solid button per view.
  return <Button variant="solid" onClick={() => save(42)}>Save</Button>;
}`;

export const demos: Demo[] = [
  {
    title: 'With a file name',
    description: 'The copy button sits in the header; the language comes from the file name.',
    render: () => (
      <CodeBlock title="save.tsx" code={tsx} />
    ),
  },
  {
    title: 'Without a title',
    description: 'The copy button floats in the top corner, inside the panel.',
    render: () => (
      <CodeBlock language="bash" code={'npx monoline add button'} />
    ),
  },
  {
    title: 'Line numbers',
    render: () => (
      <CodeBlock
        title="tokens.css"
        lineNumbers
        code={':root {\n  --accent: #FF4500;\n  --radius: 0;\n}\n\n[data-radius="soft"] { --radius: 6px; }'}
      />
    ),
  },
];
