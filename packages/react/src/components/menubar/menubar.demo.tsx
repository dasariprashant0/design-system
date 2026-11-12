import type {Demo} from '../../demo';
import {Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSeparator, MenubarTrigger} from './menubar';

export const demos: Demo[] = [
  {title: 'App menu', render: () => (
    <Menubar aria-label="Application">
      <MenubarMenu><MenubarTrigger>File</MenubarTrigger><MenubarContent><MenubarItem>New file</MenubarItem><MenubarItem>Open</MenubarItem><MenubarSeparator /><MenubarItem>Quit</MenubarItem></MenubarContent></MenubarMenu>
      <MenubarMenu><MenubarTrigger>Edit</MenubarTrigger><MenubarContent><MenubarItem>Undo</MenubarItem><MenubarItem>Redo</MenubarItem></MenubarContent></MenubarMenu>
    </Menubar>
  )},
];
