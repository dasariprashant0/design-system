// Search palette on the kit's own Command. Ctrl/Cmd+K toggles it (built into Command), "/" opens it.
import {Command, useHotkeys, type CommandItem} from '@monoline/react';
import {entries} from './registry';
import {href, navigate} from './router';

const TAB = {start: 'Get started', components: 'Components', icons: 'Icons', editor: 'Editor', tools: 'Tools'} as const;

const items: CommandItem[] = [
  {id: 'playground', label: 'Playground', group: 'Tools', keywords: ['editor', 'live', 'try', 'code', 'sandbox'], onSelect: () => navigate(href('playground'))},
  ...entries.map((e): CommandItem => ({
    id: e.path,
    label: e.title,
    group: e.kind === 'hook' ? 'Hooks' : TAB[e.tab],
    keywords: [e.description, ...e.keywords],
    onSelect: () => navigate(href(e.path)),
  })),
];

export function Search({open, onOpenChange}: {open: boolean; onOpenChange: (o: boolean) => void}) {
  useHotkeys({'/': () => onOpenChange(true)});
  return <Command open={open} onOpenChange={onOpenChange} shortcut="mod+k" items={items} title="Search the docs" placeholder="Search components, hooks and pages" emptyText="Nothing matches. Try a shorter word." />;
}
