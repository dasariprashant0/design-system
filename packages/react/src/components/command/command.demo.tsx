import type {Demo} from '../../demo';
import {Command, type CommandItem} from './command';

const items: CommandItem[] = [
  {id: 'new', label: 'New file', group: 'File', hint: 'N'},
  {id: 'open', label: 'Open file', group: 'File', hint: 'O', keywords: ['browse']},
  {id: 'save', label: 'Save', group: 'File', hint: 'S'},
  {id: 'theme', label: 'Switch theme', group: 'View', keywords: ['dark', 'light']},
  {id: 'zoom', label: 'Zoom in', group: 'View'},
  {id: 'help', label: 'Open help'},
];

export const demos: Demo[] = [
  {title: 'Palette', description: 'Press Ctrl or Cmd + K, or use the button.', render: () => (
    <Command shortcut="mod+k" items={items} trigger={<button type="button" className="btn btn-outline">Open palette</button>} />
  )},
];
