import {useEffect, type ReactNode} from 'react';
import {Avatar, BlockCta, BlockFeatureGrid, BlockFooter, BlockHero, BlockPricing, BlockTestimonials, Button, CodeBlock, Container, Link, useToggle} from '@monoline/react';

const icon = (d: string): ReactNode => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d={d} /></svg>
);

const features = [
  {title: 'Plain CSS tokens', description: 'Change a variable, change the product. No build step and no runtime styling.', icon: icon('M4 4h16v16H4z')},
  {title: 'Accessible by default', description: 'Keyboard and screen reader behaviour tested in every component.', icon: icon('M12 3v18M3 12h18')},
  {title: 'Tiny bundles', description: 'One file per component, so you only ship what the page uses.', icon: icon('M5 12h14')},
  {title: 'Three themes', description: 'Warm, dark and midnight, with eight accents on one attribute.', icon: icon('M12 3a9 9 0 100 18V3z')},
  {title: 'Copy or install', description: 'Use the packages or copy a component into your repo with the CLI.', icon: icon('M8 8h12v12H8zM4 4h12')},
  {title: 'Built for AI tools', description: 'A registry and llms.txt describe every component and prop.', icon: icon('M4 12l5 5L20 6')},
];

const tier = (name: string, monthly: string, yearly: string, features: string[], extra: object = {}) => ({
  name, description: `For ${name === 'Hobby' ? 'side projects' : name === 'Team' ? 'growing teams' : 'large companies'}.`, price: {monthly, yearly}, features, ctaLabel: name === 'Business' ? 'Contact sales' : 'Start free trial', ...extra,
});

export function App() {
  const [dark, toggleDark] = useToggle(false);
  useEffect(() => { document.documentElement.dataset.theme = dark ? 'dark' : 'warm'; }, [dark]);
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="site-header">
        <Container size="page" className="bar">
          <strong>Northwind</strong>
          <nav aria-label="Primary">
            <Link href="#features">Features</Link>
            <Link href="#pricing">Pricing</Link>
            <Link href="#customers">Customers</Link>
          </nav>
          <Button variant="line" size="sm" aria-pressed={dark} onClick={toggleDark}>{dark ? 'Light' : 'Dark'} mode</Button>
        </Container>
      </header>

      <main id="main">
        <Container size="page" className="band">
          <BlockHero
            eyebrow="New: usage reports"
            title="Ship the dull parts of your product in an afternoon"
            description="Northwind handles billing, roles and audit logs, so your team can build what only you can."
            actions={<><Button variant="solid">Start free trial</Button><Button variant="line">Book a demo</Button></>}
            media={<CodeBlock language="bash" code={'npm install northwind\nnpx northwind init'} />}
          />
        </Container>

        <Container size="page" className="band" id="features">
          <BlockFeatureGrid title="Everything a small team needs" description="Six things we would want on day one." features={features} />
        </Container>

        <Container size="page" className="band" id="pricing">
          <BlockPricing
            title="Simple pricing"
            description="Cancel any time."
            tiers={[
              tier('Hobby', 'Free', 'Free', ['1 project', 'Community support']),
              tier('Team', '$29', '$24', ['Unlimited projects', 'Roles and audit log', 'Email support'], {highlighted: true}),
              tier('Business', 'Talk to us', 'Talk to us', ['Single sign-on', 'Uptime SLA', 'Named engineer']),
            ]}
            onSelect={(t, i) => alert(`${String(t.name)} (${i})`)}
          />
        </Container>

        <Container size="page" className="band" id="customers">
          <BlockTestimonials
            title="Teams that stopped worrying"
            items={[
              {quote: 'We replaced three internal tools in a week.', name: 'Priya Nair', role: 'CTO, Brightline', avatar: <Avatar name="Priya Nair" />},
              {quote: 'The audit log alone paid for the plan.', name: 'Marcus Webb', role: 'Head of Ops, Tallis', avatar: <Avatar name="Marcus Webb" />},
              {quote: 'Setup took one afternoon, support answers in minutes.', name: 'Lena Fischer', role: 'Founder, Oakhouse', avatar: <Avatar name="Lena Fischer" />},
            ]}
          />
        </Container>

        <Container size="page" className="band">
          <BlockCta title="Start your free trial today" description="No card needed." actions={<Button variant="solid">Create account</Button>} />
        </Container>
      </main>

      <BlockFooter
        brand={<strong>Northwind</strong>}
        description="Billing and roles for small teams."
        columns={[
          {title: 'Product', links: [{label: 'Features', href: '#features'}, {label: 'Pricing', href: '#pricing'}]},
          {title: 'Company', links: [{label: 'About', href: '#'}, {label: 'Careers', href: '#'}]},
          {title: 'Legal', links: [{label: 'Privacy', href: '#'}, {label: 'Terms', href: '#'}]},
        ]}
        legal="© 2026 Northwind Ltd."
      />
    </>
  );
}
