// Stub: docs-content replaces this file with the real component page. Only shell/App.tsx imports it.
import type {ComponentMeta} from '@monoline/react';
import {demosFor} from '../shell/registry';

export function ComponentDoc({meta}: {meta: ComponentMeta}) {
  return (
    <>
      <p className="label">{meta.category.replaceAll('-', ' ')}</p>
      <h1 className="display display-md">{meta.title}</h1>
      <p className="lede">{meta.description}</p>
      {demosFor(meta.name).map((d) => (
        <section key={d.title} className="block">
          <h2 className="label">{d.title}</h2>
          {d.description && <p className="muted small">{d.description}</p>}
          <div className="stage">{d.render()}</div>
        </section>
      ))}
    </>
  );
}
