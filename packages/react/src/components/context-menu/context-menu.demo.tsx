import type {Demo} from '../../demo';
import {ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuLabel, ContextMenuSeparator, ContextMenuTrigger} from './context-menu';

export const demos: Demo[] = [
  {title: 'Right click the box', render: () => (
    <ContextMenu>
      <ContextMenuTrigger><div style={{display: 'grid', placeItems: 'center', height: '120px', border: '1px dashed var(--rule)'}}>Right click here</div></ContextMenuTrigger>
      <ContextMenuContent><ContextMenuLabel>File</ContextMenuLabel><ContextMenuItem>Rename</ContextMenuItem><ContextMenuItem>Duplicate</ContextMenuItem><ContextMenuSeparator /><ContextMenuItem tone="danger">Delete</ContextMenuItem></ContextMenuContent>
    </ContextMenu>
  )},
];
