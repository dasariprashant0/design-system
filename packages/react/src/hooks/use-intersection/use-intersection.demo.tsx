import type {Demo} from '../../demo';
import {useIntersection} from './use-intersection';

function Demo() {
  const [ref, entry] = useIntersection<HTMLDivElement>({threshold: 0.5});
  return (
    <div style={{height: '120px', overflowY: 'auto', border: '1px solid var(--rule)'}} tabIndex={0} aria-label="Scrollable area">
      <div style={{height: '160px', padding: 'var(--s3)'}}>Scroll down</div>
      <div ref={ref} style={{padding: 'var(--s4)', background: entry?.isIntersecting ? 'var(--wash-2)' : 'transparent'}}>{entry?.isIntersecting ? 'In view' : 'Out of view'}</div>
      <div style={{height: '120px'}} />
    </div>
  );
}

export const demos: Demo[] = [{title: 'Scroll to reveal', render: () => <Demo />}];
