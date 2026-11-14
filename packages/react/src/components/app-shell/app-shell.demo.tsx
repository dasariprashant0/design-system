import type {CSSProperties} from 'react';
import type {Demo} from '../../demo';
import {Breadcrumb} from '../breadcrumb';
import {Button} from '../button';
import {Command} from '../command';
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger} from '../dropdown-menu';
import {Navbar} from '../navbar';
import {PageHeader} from '../page-header';
import {Sidebar, SidebarContent, SidebarGroup, SidebarHeader, SidebarItem, SidebarToggle, SidebarTrigger} from '../sidebar';
import {AppShell} from './app-shell';

const Icon = ({d}: {d: string}) => <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d={d} /></svg>;
const height = {'--app-shell-height': '34rem'} as CSSProperties;
const actions = [{id: 'new', label: 'New project', group: 'Create'}, {id: 'invite', label: 'Invite a teammate', group: 'Create'}, {id: 'theme', label: 'Switch theme', group: 'View'}];

const sidebar = (
  <Sidebar drawerTitle="Acme">
    <SidebarHeader><span>Acme</span><SidebarToggle /></SidebarHeader>
    <SidebarContent>
      <SidebarGroup label="Workspace">
        <SidebarItem href="#overview" current icon={<Icon d="M2 8l6-5 6 5v6H2z" />}>Overview</SidebarItem>
        <SidebarItem href="#reports" icon={<Icon d="M3 13V8M8 13V3M13 13V6" />}>Reports</SidebarItem>
        <SidebarItem href="#team" icon={<Icon d="M8 8a3 3 0 100-6 3 3 0 000 6zM2 14c0-3 3-4 6-4s6 1 6 4" />}>Team</SidebarItem>
      </SidebarGroup>
    </SidebarContent>
  </Sidebar>
);

const navbar = (
  <Navbar
    leading={<SidebarTrigger />}
    actions={(
      <>
        <Command shortcut="mod+j" title="Command palette" items={actions} trigger={<Button size="sm">Search…</Button>} />
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button size="sm">Account</Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Ada Example</DropdownMenuLabel>
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </>
    )}
  />
);

const header = <PageHeader breadcrumbs={<Breadcrumb items={[{label: 'Home', href: '#'}, {label: 'Reports'}]} />} title="Reports" description="Weekly numbers for your workspace." actions={<Button variant="solid">New report</Button>} />;

export const demos: Demo[] = [
  {title: 'App shell', description: 'Navbar, sidebar, breadcrumb, page header, a user menu and a command palette (Ctrl or Cmd + J). The sidebar and main scroll on their own here (`scroll="contained"`); narrow the window for the drawer.', render: () => (
    <AppShell scroll="contained" style={height} navbar={navbar} sidebar={sidebar}>{header}<p>Your page goes here.</p></AppShell>
  )},
  {title: 'With an aside', description: 'From 1100px wide the aside sits beside the page; below that it stacks under it.', render: () => (
    <AppShell scroll="contained" style={{...height, '--app-shell-aside': '12rem'} as CSSProperties} navbar={navbar} sidebar={sidebar} aside={<p>Recent activity</p>}>{header}</AppShell>
  )},
];
