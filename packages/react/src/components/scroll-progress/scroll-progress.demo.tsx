import type {Demo} from '../../demo';
import {ScrollProgress} from './scroll-progress';

export const demos: Demo[] = [
  {title: 'Page progress', description: 'Fixed to the top of the window; scroll this page to see it fill.', render: () => <ScrollProgress />},
  {title: 'Named for assistive tech', description: 'Pass `label` to expose it as a progressbar.', render: () => <ScrollProgress label="Reading progress" style={{top: 'var(--s2)'}} />},
];
