import type {Demo} from '../../demo';
import {useState} from 'react';
import {Tag} from './tag';

function Removable() {
  const [tags, setTags] = useState(['design', 'code', 'writing']);
  return <div style={{display: 'flex', gap: 'var(--s2)', flexWrap: 'wrap'}}>{tags.map((t) => <Tag key={t} onRemove={() => setTags(tags.filter((x) => x !== t))}>{t}</Tag>)}</div>;
}

export const demos: Demo[] = [
  {
    title: 'Plain',
    render: () => (
      <Tag>design</Tag>
    ),
  },
  {
    title: 'Removable',
    render: () => (
      <Removable />
    ),
  },
];
