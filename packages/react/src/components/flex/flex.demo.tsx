import type {Demo} from '../../demo';
import {Flex} from './flex';
import {Badge} from '../badge';

export const demos: Demo[] = [
  {
    title: 'Space between',
    render: () => (
      <Flex justify="between" align="center" gap={3}>
        <Badge>left</Badge>
        <Badge>right</Badge>
      </Flex>
    ),
  },
  {
    title: 'Reversed column',
    render: () => (
      <Flex direction="column-reverse" gap={2} align="start">
        <Badge>first in source</Badge>
        <Badge>second in source</Badge>
      </Flex>
    ),
  },
  {
    title: 'Inline',
    render: () => (
      <div>Text with an <Flex inline gap={1} align="baseline"><Badge>inline</Badge><Badge>flex</Badge></Flex> in the line.</div>
    ),
  },
];
