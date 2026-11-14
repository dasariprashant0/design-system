import {useState} from 'react';
import type {Demo} from '../../demo';
import {NotificationCenter, type NotificationItem} from './notification-center';

const start: NotificationItem[] = [
  {id: '1', title: 'Deploy finished', description: 'Production, 41 seconds.', time: '2 min ago'},
  {id: '2', title: 'Ada commented on your pull request', time: '1 hour ago'},
  {id: '3', title: 'Invoice paid', time: 'Yesterday', read: true},
];

function Demo1() {
  const [list, setList] = useState(start);
  return (
    <div style={{display: 'flex', justifyContent: 'flex-end', minHeight: '280px'}}>
      <NotificationCenter
        notifications={list}
        onMarkRead={(id) => setList((l) => l.map((n) => (n.id === id ? {...n, read: true} : n)))}
        onMarkAllRead={() => setList((l) => l.map((n) => ({...n, read: true})))}
        onClear={() => setList([])}
      />
    </div>
  );
}

export const demos: Demo[] = [{
  title: 'Inbox',
  description: 'Mark items read, then clear the list to see the empty state.',
  render: () => (
    <Demo1 />
  ),
}];
