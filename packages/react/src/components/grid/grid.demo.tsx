import type {Demo} from '../../demo';
import {Grid} from './grid';
import {Card} from '../card';

export const demos: Demo[] = [
  {
    title: 'Three columns',
    render: () => (
      <Grid columns={3}>
        {['One', 'Two', 'Three'].map((n) => <Card key={n}>{n}</Card>)}
      </Grid>
    ),
  },
  {
    title: 'Auto-fit',
    render: () => (
      <Grid minColumn="10rem">
        {['A', 'B', 'C', 'D'].map((n) => <Card key={n}>{n}</Card>)}
      </Grid>
    ),
  },
];
