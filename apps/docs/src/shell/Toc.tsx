// "On this page": the h2 and h3 of the current page, with the one being read highlighted.
import {useScrollSpy} from '@monoline/react';
import type {Heading} from './headings';

export function Toc({headings}: {headings: Heading[]}) {
  const active = useScrollSpy(headings.map((h) => h.id), 96);
  return (
    <aside className="docs-rail" aria-label="On this page">
      <p className="label">On this page</p>
      <ul>
        {headings.map((h) => (
          <li key={h.id} data-level={h.level}>
            <a href={`#${h.id}`} aria-current={h.id === active ? 'location' : undefined}>{h.text}</a>
          </li>
        ))}
      </ul>
    </aside>
  );
}
