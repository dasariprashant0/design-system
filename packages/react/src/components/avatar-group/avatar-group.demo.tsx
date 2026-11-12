import type {Demo} from '../../demo';
import {Avatar} from '../avatar';
import {AvatarGroup} from './avatar-group';

export const demos: Demo[] = [
  {title: 'Max 3', render: () => <AvatarGroup aria-label="Project members" max={3}>{['Ada Lovelace', 'Grace Hopper', 'Alan Turing', 'Linus Torvalds'].map((n) => <Avatar key={n} name={n} />)}</AvatarGroup>},
];
