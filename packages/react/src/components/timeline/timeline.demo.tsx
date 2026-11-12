import type {Demo} from '../../demo';
import {Timeline, TimelineItem} from './timeline';

export const demos: Demo[] = [
  {title: 'Activity', render: () => <Timeline aria-label="Activity"><TimelineItem title="Project created" time="3 days ago" dateTime="2026-11-09">Ada started the project.</TimelineItem><TimelineItem title="First release" time="Yesterday" dateTime="2026-11-11" /><TimelineItem title="Public" time="Today" dateTime="2026-11-12" /></Timeline>},
];
