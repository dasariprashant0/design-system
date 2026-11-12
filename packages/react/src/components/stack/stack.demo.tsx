import type {Demo} from '../../demo';
import {Stack} from './stack';
import {Badge} from '../badge';

export const demos: Demo[] = [
  {title: 'Column', render: () => <Stack gap={2}><Badge>one</Badge><Badge>two</Badge><Badge>three</Badge></Stack>},
  {title: 'Row, wrapped', render: () => <Stack direction="row" wrap gap={2} align="center"><Badge>one</Badge><Badge>two</Badge><Badge variant="solid">three</Badge></Stack>},
];
