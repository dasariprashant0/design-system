import type {Demo} from '../../demo';
import {Typewriter} from './typewriter';

export const demos: Demo[] = [
  {title: 'Default', render: () => <p style={{fontFamily: 'var(--font-display)', fontSize: 'var(--display-sm)'}}><Typewriter text="Small parts, drawn with thin lines." /></p>},
  {title: 'Slow, no caret', render: () => <p><Typewriter text="Ship the quiet version." speed={90} delay={400} cursor={false} /></p>},
];
