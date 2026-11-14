import type {CSSProperties, ReactNode} from 'react';
import type {Demo} from '../../demo';
import {useLocalStorage} from '../../hooks/use-local-storage';
import {Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarHeader, SidebarItem, SidebarProvider, SidebarToggle, SidebarTrigger, useSidebar} from './sidebar';

const Icon = ({d}: {d: string}) => <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d={d} /></svg>;
const frame: CSSProperties = {display: 'flex', alignItems: 'stretch', minBlockSize: '22rem', border: '1px solid var(--rule)'};

function Brand() {
  const {collapsed} = useSidebar();
  return <SidebarHeader>{!collapsed && <span>Acme</span>}<SidebarToggle /></SidebarHeader>;
}
function Nav({children}: {children?: ReactNode}) {
  return (
    <>
      <Brand />
      <SidebarContent>
        <SidebarGroup label="Workspace">
          <SidebarItem href="#overview" current icon={<Icon d="M2 8l6-5 6 5v6H2z" />}>Overview</SidebarItem>
          <SidebarItem href="#reports" icon={<Icon d="M3 13V8M8 13V3M13 13V6" />}>Reports</SidebarItem>
          <SidebarItem href="#team" icon={<Icon d="M8 8a3 3 0 100-6 3 3 0 000 6zM2 14c0-3 3-4 6-4s6 1 6 4" />}>Team</SidebarItem>
        </SidebarGroup>
        <SidebarGroup label="Account">
          <SidebarItem href="#billing" icon={<Icon d="M2 4h12v8H2zM2 7h12" />}>Billing</SidebarItem>
        </SidebarGroup>
      </SidebarContent>
      {children}
    </>
  );
}

function Persisted() {
  const [collapsed, setCollapsed] = useLocalStorage('sidebar-demo-collapsed', false);
  return (
    <SidebarProvider collapsed={collapsed} onCollapsedChange={setCollapsed}>
      <div style={frame}>
        <Sidebar drawerTitle="Acme"><Nav /></Sidebar>
        <div style={{padding: 'var(--s5)'}}><SidebarTrigger />{' '}Collapse it and reload: the choice is kept in localStorage.</div>
      </div>
    </SidebarProvider>
  );
}

export const demos: Demo[] = [
  {title: 'Groups and icons', description: 'The toggle collapses the sidebar to icons; each label moves into a tooltip. Narrow the window: the sidebar becomes a Menu button and a drawer.', render: () => (
    <SidebarProvider>
      <div style={frame}>
        <Sidebar drawerTitle="Acme"><Nav><SidebarFooter><SidebarGroup><SidebarItem href="#help" icon={<Icon d="M8 14A6 6 0 108 2a6 6 0 000 12zM8 11v.01M6.5 6.5a1.5 1.5 0 113 0c0 1-1.5 1-1.5 2" />}>Help</SidebarItem></SidebarGroup></SidebarFooter></Nav></Sidebar>
        <div style={{padding: 'var(--s5)'}}><SidebarTrigger /></div>
      </div>
    </SidebarProvider>
  )},
  {title: 'Remember the collapsed state', description: 'Control it with `collapsed` and `onCollapsedChange`, here saved with `useLocalStorage`.', render: () => <Persisted />},
  {title: 'Starts collapsed', render: () => (
    <SidebarProvider defaultCollapsed>
      <div style={frame}><Sidebar drawerTitle="Acme"><Nav /></Sidebar></div>
    </SidebarProvider>
  )},
];
