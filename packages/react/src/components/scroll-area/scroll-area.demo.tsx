import type {Demo} from '../../demo';
import {ScrollArea} from './scroll-area';

export const demos: Demo[] = [
  {
    title: 'Vertical',
    render: () => (
      <ScrollArea
        style={{height: '160px', width: '320px', border: '1px solid var(--rule)'}}
        viewportProps={{'aria-label': 'Release notes'}}
      >
        <div style={{padding: 'var(--s3)'}}>
          {Array.from({length: 20}, (_, i) => <p key={i}>Release note {i + 1}</p>)}
        </div>
      </ScrollArea>
    ),
  },
];
