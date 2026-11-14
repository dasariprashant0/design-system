import {useState} from 'react';
import type {Demo} from '../../demo';
import {RichTextEditor} from './rich-text-editor';

function Controlled() {
  const [html, setHtml] = useState('<h2>Release notes</h2><p>Select text, then use the toolbar or <strong>Cmd/Ctrl+B</strong>.</p>');
  return (
    <div>
      <RichTextEditor aria-label="Release notes" value={html} onValueChange={setHtml} />
      <pre style={{whiteSpace: 'pre-wrap', fontSize: 'var(--text-xs)'}}>{html}</pre>
    </div>
  );
}

export const demos: Demo[] = [
  {
    title: 'Basic',
    render: () => (
      <RichTextEditor aria-label="Notes" placeholder="Write something…" />
    ),
  },
  {
    title: 'Controlled, with the HTML shown',
    render: () => (
      <Controlled />
    ),
  },
  {
    title: 'Read only',
    render: () => (
      <RichTextEditor
        aria-label="Changelog"
        readOnly
        defaultValue="<p>Read-only <em>content</em> with a <a href='https://example.com'>link</a>.</p>"
      />
    ),
  },
  {
    title: 'Disabled',
    render: () => (
      <RichTextEditor aria-label="Locked notes" disabled defaultValue="<p>Disabled.</p>" />
    ),
  },
];
