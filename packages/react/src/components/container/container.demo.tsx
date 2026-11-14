import type {Demo} from '../../demo';
import {Container} from './container';

export const demos: Demo[] = [
  {
    title: 'Reading column',
    render: () => (
      <Container size="text">
        <p>A column about 64 characters wide, centred, with side padding.</p>
      </Container>
    ),
  },
];
