import type {Demo} from '../../demo';
import {Box} from './box';

export const demos: Demo[] = [
  {title: 'Padding and border', render: () => <Box padding={5} border>A bordered box with step 5 padding.</Box>},
  {title: 'One side, as a section', render: () => <Box asChild paddingY={4} border="top"><section aria-label="Notes">A top rule and vertical padding only.</section></Box>},
];
