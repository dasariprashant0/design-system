import type {Demo} from '../../demo';
import {Button} from './button';

export const demos: Demo[] = [
  {
    title: 'Variants',
    description: 'One solid button per view. Everything else is line or ghost.',
    render: () => (
      <div style={{display: 'flex', gap: 'var(--s3)', flexWrap: 'wrap'}}>
        <Button variant="solid">Write today</Button>
        <Button variant="line">Open folder</Button>
        <Button variant="ghost">Show all</Button>
        <Button variant="danger">Delete entry</Button>
      </div>
    ),
  },
  {
    title: 'States',
    render: () => (
      <div style={{display: 'flex', gap: 'var(--s3)', flexWrap: 'wrap'}}>
        <Button size="sm">Small</Button>
        <Button disabled>Disabled</Button>
        <Button loading>Saving</Button>
      </div>
    ),
  },
  {
    title: 'As a link',
    description: 'asChild keeps the semantics of the child, so this is a real link.',
    render: () => <Button asChild variant="solid"><a href="#buttons">Read the docs</a></Button>,
  },
];
