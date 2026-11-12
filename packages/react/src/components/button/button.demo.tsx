import type {Demo} from '../../demo';
import {Input} from '../input';
import {NativeSelect} from '../native-select';
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
    title: 'Sizes and form rows',
    description: 'Button, Input and NativeSelect share one height at each size (`sm`, `md`, `lg`), so they line up in a row.',
    render: () => (
      <div style={{display: 'grid', gap: 'var(--s4)'}}>
        {(['sm', 'md', 'lg'] as const).map((size) => (
          <div key={size} style={{display: 'flex', gap: 'var(--s3)', alignItems: 'center'}}>
            <Input aria-label={`Name, ${size}`} size={size} placeholder={size} />
            <NativeSelect aria-label={`Kind, ${size}`} size={size}><option>Entry</option><option>Note</option></NativeSelect>
            <Button size={size} variant="solid">Add</Button>
          </div>
        ))}
      </div>
    ),
  },
  {
    title: 'As a link',
    description: 'asChild keeps the semantics of the child, so this is a real link.',
    render: () => <Button asChild variant="solid"><a href="#buttons">Read the docs</a></Button>,
  },
];
