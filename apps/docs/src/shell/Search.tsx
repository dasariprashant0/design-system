// Search palette on the kit's own Command. Ctrl/Cmd+K toggles it (built into Command), "/" opens it.
import {Command, useHotkeys, type CommandItem} from '@monoline/react';
import {entries} from './registry';
import {href, navigate} from './router';

const GROUP = {site: 'Explore', guide: 'Guides', component: 'Components', hook: 'Hooks'} as const;

const items: CommandItem[] = entries.map((e) => ({
  id: e.path,
  label: e.title,
  group: GROUP[e.kind],
  keywords: [e.description, ...e.keywords],
  onSelect: () => navigate(href(e.path)),
}));

export function Search({open, onOpenChange}: {open: boolean; onOpenChange: (o: boolean) => void}) {
  useHotkeys({'/': () => onOpenChange(true)});
  return <Command open={open} onOpenChange={onOpenChange} shortcut="mod+k" items={items} title="Search the docs" placeholder="Search components, hooks and guides" emptyText="Nothing matches. Try a shorter word." />;
}
