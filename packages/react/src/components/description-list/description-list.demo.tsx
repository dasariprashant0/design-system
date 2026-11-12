import type {Demo} from '../../demo';
import {DescriptionList} from './description-list';

export const demos: Demo[] = [
  {title: 'Account', render: () => <DescriptionList items={[{term: 'Plan', details: 'Pro'}, {term: 'Seats', details: '12'}, {term: 'Renews', details: '1 March 2027'}]} />},
];
