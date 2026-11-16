import type {Entry} from './registry';
import {neighbours} from './registry';
import {href} from './router';

const Chevron = ({back}: {back?: boolean}) => (
  <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" focusable="false" style={back ? {transform: 'scaleX(-1)'} : undefined}><path d="m6 3.5 4.5 4.5L6 12.5" /></svg>
);

/** Cards for the previous and next page in the sidebar order: the title, an arrow and the first line of the description. */
export function Pager({entry}: {entry: Entry}) {
  const {prev, next} = neighbours(entry);
  if (!prev && !next) return null;
  return (
    <nav className="pager" aria-label="Previous and next">
      {prev ? <a className="pager-link" href={href(prev.path)} rel="prev"><span className="pager-title"><Chevron back /> {prev.title}</span><span className="pager-desc">{prev.description}</span></a> : <span />}
      {next ? <a className="pager-link pager-next" href={href(next.path)} rel="next"><span className="pager-title">{next.title} <Chevron /></span><span className="pager-desc">{next.description}</span></a> : <span />}
    </nav>
  );
}
