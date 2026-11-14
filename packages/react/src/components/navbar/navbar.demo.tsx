import type {Demo} from '../../demo';
import {Button} from '../button';
import {Navbar} from './navbar';

const links = [{label: 'Product', href: '#product', current: true}, {label: 'Pricing', href: '#pricing'}, {label: 'Docs', href: '#docs'}];

export const demos: Demo[] = [
  {title: 'Brand, links and actions', description: 'Narrow the window: the links move into a drawer behind the Menu button.', render: () => (
    <Navbar brand="Acme" links={links} actions={<Button variant="solid" size="sm">Sign in</Button>} />
  )},
  {title: 'With a client router', description: 'renderLink receives each link\'s props: return your router\'s link. The demo uses a plain anchor to show the shape.', render: () => (
    <Navbar brand="Acme" links={links} renderLink={({href, children, ...p}) => <a {...p} href={href} onClick={(e) => e.preventDefault()}>{children}</a>} />
  )},
];
