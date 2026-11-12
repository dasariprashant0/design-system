import type {Demo} from '../../demo';
import {BlockDashboardShell} from './block-dashboard-shell';
import {Heading} from '../heading';
import {Text} from '../text';
import {Badge} from '../badge';

export const demos: Demo[] = [
  {title: 'Sidebar, top bar and content', description: 'Narrow the window: the sidebar becomes a Menu button and a drawer.', render: () => (
    <BlockDashboardShell
      brand="Your app"
      nav={[{label: 'Overview', href: '#', current: true}, {label: 'Reports', href: '#'}, {label: 'Customers', href: '#'}, {label: 'Settings', href: '#'}]}
      topbar={<Badge>Ada Example</Badge>}
    >
      <Heading level={1} size="xl">Overview</Heading>
      <Text tone="muted">Your content goes here.</Text>
    </BlockDashboardShell>
  )},
];
