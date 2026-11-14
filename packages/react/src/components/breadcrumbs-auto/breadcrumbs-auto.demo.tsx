import type {Demo} from '../../demo';
import {BreadcrumbsAuto} from './breadcrumbs-auto';

export const demos: Demo[] = [
  {title: 'From a path', description: 'Pass `pathname` from your router. Give a segment a nicer label with `labels`.', render: () => (
    <BreadcrumbsAuto pathname="/projects/website-redesign/settings" labels={{'website-redesign': 'Website redesign'}} />
  )},
];
