import type {Demo} from '../../demo';
import {Rating} from './rating';

export const demos: Demo[] = [
  {title: 'Editable', render: () => <Rating aria-label="Rate this page" defaultValue={3} />},
  {title: 'Read only', render: () => <Rating aria-label="Average rating" value={4} readOnly />},
];
