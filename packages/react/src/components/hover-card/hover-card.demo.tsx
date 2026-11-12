import type {Demo} from '../../demo';
import {HoverCard, HoverCardContent, HoverCardTrigger} from './hover-card';

export const demos: Demo[] = [
  {title: 'Profile preview', render: () => <HoverCard><HoverCardTrigger asChild><a href="#ada">@ada</a></HoverCardTrigger><HoverCardContent><strong>Ada Lovelace</strong><p className="muted small">Wrote the first published program.</p></HoverCardContent></HoverCard>},
];
