// Mini app screens for the home page "Components" showcase. Every piece is a real Monoline component, so what you
// see here is what you get. All names, numbers and copy are made up for the demo.
import {Avatar, Badge, Tabs, TabsContent, TabsList, TabsTrigger, Button, Checkbox, Field, Input, Progress, RadioGroup, RadioGroupItem, SegmentedControl, Sparkline, Stat, Stepper, Switch, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Textarea} from '@monoline/react';

const USERS = [
  ['Ada Ferreira', 'Design', '3,050 pts', 'Active'],
  ['Ben Okafor', 'Sales', '2,500 pts', 'Active'],
  ['Chen Wei', 'Engineering', '2,000 pts', 'Away'],
  ['Dara Nilsson', 'Support', '1,500 pts', 'Active'],
  ['Eli Haddad', 'Finance', '1,000 pts', 'Invited'],
] as const;

export const Dashboard = () => (
  <div className="mock mock-dash">
    <div className="mock-row mock-between">
      <h3 className="mock-title">Overview</h3>
      <SegmentedControl aria-label="Range" defaultValue="week" options={[{value: 'day', label: 'Day'}, {value: 'week', label: 'Week'}, {value: 'month', label: 'Month'}]} />
    </div>
    <div className="mock-stats">
      <Stat label="Active users" value="12,480" note="+12% on last week" />
      <Stat label="Conversion" value="3.8%" note="+0.4 points" />
      <Stat label="Open tickets" value="37" note="-9 since Monday" />
    </div>
    <div className="mock-panel">
      <p className="mock-k">Signups, last 14 days</p>
      <Sparkline title="Signups, last 14 days" data={[3, 5, 4, 8, 6, 9, 12, 10, 14, 13, 17, 15, 19, 22]} area width={560} height={72} />
    </div>
    <div className="mock-bars">
      <div><p className="mock-k">Quota used</p><Progress aria-label="Quota used" value={72} /></div>
      <div><p className="mock-k">Onboarded</p><Progress aria-label="Onboarded" value={45} /></div>
    </div>
  </div>
);

export const Users = () => (
  <div className="mock">
    <div className="mock-row mock-between">
      <h3 className="mock-title">Top redeemers</h3>
      <Button size="sm">Invite</Button>
    </div>
    <Table wrapperLabel="Top redeemers">
      <TableHeader><TableRow><TableHead scope="col">Name</TableHead><TableHead scope="col">Team</TableHead><TableHead scope="col">Redeemed</TableHead><TableHead scope="col">Status</TableHead></TableRow></TableHeader>
      <TableBody>
        {USERS.map(([n, t, v, s]) => (
          <TableRow key={n}>
            <TableCell><span className="mock-person"><Avatar name={n} size="sm" />{n}</span></TableCell>
            <TableCell>{t}</TableCell>
            <TableCell>{v}</TableCell>
            <TableCell><Badge variant={s === 'Active' ? 'accent' : undefined}>{s}</Badge></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);

export const Settings = () => (
  <div className="mock mock-settings">
    <h3 className="mock-title">Email agent</h3>
    <Field label="Escalation team"><Input defaultValue="Support squad" /></Field>
    <RadioGroup aria-label="Tone of voice" defaultValue="casual">
      <RadioGroupItem value="casual" label="Casual" />
      <RadioGroupItem value="professional" label="Professional" />
    </RadioGroup>
    <Switch label="Move unresolved chats to unassigned" defaultChecked />
    <Switch label="Hand over to an agent in the inbox" />
    <div className="mock-row"><Button>Save changes</Button><Button variant="line">Discard</Button></div>
  </div>
);

export const Onboarding = () => (
  <div className="mock mock-onboard">
    <Stepper aria-label="Setup" current={1} steps={[{title: 'Account'}, {title: 'Workspace'}, {title: 'Invite'}]} />
    <Field label="Workspace name"><Input defaultValue="Northwind" /></Field>
    <Field label="What will you build?"><Textarea rows={2} defaultValue="An internal dashboard for the support team." /></Field>
    <Checkbox label="Send me product updates" defaultChecked />
    <div className="mock-row"><Button>Continue</Button><Button variant="line">Back</Button></div>
  </div>
);

export const Conversation = () => (
  <div className="mock mock-chat">
    <div className="mock-msg"><Avatar name="Maya Singh" size="sm" /><p className="mock-bubble">Can I move my plan to yearly?</p></div>
    <div className="mock-msg mock-msg-me"><Avatar name="Monoline Bot" size="sm" variant="line" /><p className="mock-bubble mock-bubble-me">Yes. Yearly billing starts on your next renewal date, and you keep your seats.</p></div>
    <div className="mock-msg"><Avatar name="Maya Singh" size="sm" /><p className="mock-bubble">Great, do it.</p></div>
    <div className="mock-row mock-compose"><Field label="Reply" className="mock-grow"><Input placeholder="Write a reply" /></Field><Button>Send</Button></div>
  </div>
);

/** The all-in-one board shown on the first tab: three columns of small, real cards. */
export const Board = () => (
  <div className="board">
    <div className="board-col">
      <section className="board-card" aria-label="Email agent settings">
        <h3 className="mock-title">Email agent</h3>
        <p className="mock-k">Escalation: Support squad</p>
        <RadioGroup aria-label="Tone of voice" defaultValue="casual">
          <RadioGroupItem value="casual" label="Casual" />
          <RadioGroupItem value="professional" label="Professional" />
          <RadioGroupItem value="friendly" label="Friendly" />
        </RadioGroup>
        <Switch label="Move unresolved chats to unassigned" defaultChecked />
        <div className="mock-row"><Button size="sm">Save changes</Button><Button size="sm" variant="line">Discard</Button></div>
      </section>
      <section className="board-card" aria-label="Top redeemers">
        <h3 className="mock-title">Top redeemers</h3>
        <Table wrapperLabel="Top redeemers">
          <TableHeader><TableRow><TableHead scope="col">Name</TableHead><TableHead scope="col">Redeemed</TableHead></TableRow></TableHeader>
          <TableBody>{USERS.slice(0, 4).map(([n, t, v]) => <TableRow key={n}><TableCell><span className="mock-person"><Avatar name={n} size="sm" /><span>{n}<br /><span className="mock-k">{t}</span></span></span></TableCell><TableCell>{v}</TableCell></TableRow>)}</TableBody>
        </Table>
      </section>
    </div>
    <div className="board-col">
      <section className="board-card" aria-label="Reward">
        <h3 className="mock-title">Travel credit <Badge variant="accent">500 pts</Badge></h3>
        <p className="mock-k">Give the perfect getaway: amazing places to stay and things to do, all around the world.</p>
        <Tabs defaultValue="den">
          <TabsList aria-label="Reward details"><TabsTrigger value="den">Denominations</TabsTrigger><TabsTrigger value="steps">Steps</TabsTrigger></TabsList>
          <TabsContent value="den"><div className="mock"><Switch label="$5,000 card" /><Field label="Points"><Input defaultValue="1000" /></Field></div></TabsContent>
          <TabsContent value="steps"><p className="mock-k">Pick a card, confirm the points, and the code arrives by email.</p></TabsContent>
        </Tabs>
      </section>
      <section className="board-card" aria-label="Employees without goals">
        <p className="mock-k">Employees without goals</p>
        <p className="board-big">32</p>
        <Progress aria-label="Goals set" value={68} />
        <a className="board-link" href="#home-components">View more</a>
      </section>
    </div>
    <div className="board-col">
      <section className="board-card" aria-label="Score">
        <p className="mock-k">NPS score</p>
        <p className="board-big">37 <Badge>+12%</Badge></p>
        <div className="board-seg" aria-hidden="true"><span style={{flex: 5}} /><span style={{flex: 2}} /><span style={{flex: 3}} /></div>
        <p className="mock-k">Promoters, passives, detractors</p>
      </section>
      <section className="board-card" aria-label="Indirect spend">
        <p className="mock-k">Indirect spend</p>
        <p className="board-big">$ 8,740</p>
        <p className="mock-k"><Badge variant="accent">+23.4%</Badge> vs last quarter</p>
      </section>
      <section className="board-card" aria-label="Cookie settings">
        <h3 className="mock-title">Cookie settings</h3>
        <Switch label="Strictly necessary" defaultChecked disabled />
        <Switch label="Performance" defaultChecked />
        <Switch label="Functional" />
      </section>
    </div>
  </div>
);
