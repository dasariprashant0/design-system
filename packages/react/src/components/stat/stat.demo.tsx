import type {Demo} from '../../demo';
import {Stat} from './stat';

export const demos: Demo[] = [
  {
    title: 'Row of stats',
    render: () => (
      <div style={{display: 'flex', gap: 'var(--s7)', flexWrap: 'wrap'}}>
        <Stat label="Revenue" value="$12k" note="+4% this week" />
        <Stat label="Users" value="1,204" note="all time" />
      </div>
    ),
  },
];
