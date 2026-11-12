import type {Entry} from './registry';
import {neighbours} from './registry';
import {href} from './router';

/** Previous and next page of the same kind. */
export function Pager({entry}: {entry: Entry}) {
  const {prev, next} = neighbours(entry);
  if (!prev && !next) return null;
  return (
    <nav className="pager" aria-label="Previous and next">
      {prev ? <a className="pager-link" href={href(prev.path)} rel="prev"><span className="label">Previous</span>{prev.title}</a> : <span />}
      {next ? <a className="pager-link pager-next" href={href(next.path)} rel="next"><span className="label">Next</span>{next.title}</a> : <span />}
    </nav>
  );
}
