import type {Demo} from '../../demo';
import {CopyButton} from './copy-button';

export const demos: Demo[] = [
  {title: 'Icon and text', description: 'The icon form needs no text; both announce "Copied".', render: () => (
    <div style={{display: 'flex', gap: 'var(--s3)', alignItems: 'center'}}>
      <code>npm i @monoline/react</code>
      <CopyButton value="npm i @monoline/react" label="Copy install command" size="sm" />
      <CopyButton value="npm i @monoline/react" variant="solid">Copy command</CopyButton>
    </div>
  )},
];
