import type {Demo} from '../../demo';
import {useState} from 'react';
import {useHotkeys} from './use-hotkeys';

function HotkeysDemo() {
  const [last, setLast] = useState('none yet');
  useHotkeys({
    'mod+k': () => setLast('mod+k'),
    'shift+h': () => setLast('shift+h'),
    escape: () => setLast('escape'),
  });
  return (
    <div>
      <p>Press Mod+K (Cmd on macOS, Ctrl elsewhere), Shift+H or Escape.</p>
      <p>Last shortcut: {last}</p>
    </div>
  );
}

export const demos: Demo[] = [{title: 'Shortcuts', description: 'Ignored while typing in a field.', render: () => <HotkeysDemo />}];
