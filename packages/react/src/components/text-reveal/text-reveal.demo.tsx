import type {Demo} from '../../demo';
import {TextReveal} from './text-reveal';

export const demos: Demo[] = [
  {
    title: 'Default',
    render: () => (
      <TextReveal
        text="Every word arrives in turn, so the eye can follow the sentence."
        style={{fontFamily: 'var(--font-display)', fontSize: 'var(--display-sm)'}}
      />
    ),
  },
  {
    title: 'Slower',
    render: () => (
      <TextReveal text="Take your time with this one." stagger={200} />
    ),
  },
];
