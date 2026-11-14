import type {Demo} from '../../demo';
import {ShimmerButton} from './shimmer-button';

export const demos: Demo[] = [
  {
    title: 'Solid',
    render: () => (
      <ShimmerButton>Start free trial</ShimmerButton>
    ),
  },
  {
    title: 'Line',
    render: () => (
      <ShimmerButton variant="line">Read the docs</ShimmerButton>
    ),
  },
];
