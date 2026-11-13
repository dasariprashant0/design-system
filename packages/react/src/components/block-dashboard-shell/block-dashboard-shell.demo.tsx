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
  {title: 'With a client router', description: 'renderLink receives each link\'s props. Return your router\'s link: React Router `({href, ...p}) => <NavLink to={href} {...p} />`, Next.js `(p) => <NextLink {...p} />`. The demo uses a plain anchor to show the shape.', render: () => (
    <BlockDashboardShell
      brand="Your app"
      nav={[{label: 'Overview', href: '#overview', current: true}, {label: 'Reports', href: '#reports'}]}
      renderLink={({href, children, ...p}) => <a {...p} href={href} onClick={(e) => e.preventDefault()}>{children}</a>}
    >
      <Heading level={1} size="xl">Overview</Heading>
    </BlockDashboardShell>
  )},
];
