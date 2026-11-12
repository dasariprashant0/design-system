import {useMemo, useState} from 'react';
import {
  Avatar, Badge, BarChart, BlockDashboardShell, Button, Card, CardContent, CardHeader, CardTitle, Command, DataTable, DatePicker,
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DropdownMenu, DropdownMenuContent,
  DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger,
  Field, Form, Grid, Heading, Input, LineChart, SegmentedControl, Stat, Text, useHash, type DataTableColumn,
} from '@monoline/react';
import {money, orders, type Order} from './data';
import {accents, themes, useLook, type Accent, type Theme} from './theme';
import {Toasts, useToast} from './toasts';

const statusLabel = {paid: 'Paid', pending: 'Pending', refunded: 'Refunded'} as const;

const columns: DataTableColumn<Order>[] = [
  {id: 'id', header: 'Order', sortable: true},
  {id: 'customer', header: 'Customer', sortable: true, cell: (o) => <><strong>{o.customer}</strong><br /><Text size="xs" tone="muted">{o.email}</Text></>},
  {id: 'date', header: 'Date', sortable: true, accessor: (o) => o.date, cell: (o) => o.date.toLocaleDateString('en-US', {dateStyle: 'medium'})},
  {id: 'status', header: 'Status', sortable: true, cell: (o) => <Badge variant={o.status === 'pending' ? 'outline' : 'solid'}>{statusLabel[o.status]}</Badge>},
  {id: 'amount', header: 'Amount', sortable: true, align: 'end', accessor: (o) => o.amount, cell: (o) => money(o.amount)},
];

function Dashboard() {
  const toast = useToast();
  const {theme, setTheme, accent, setAccent} = useLook();
  const [hash, setHash] = useHash();
  const page = hash === 'orders' ? 'orders' : 'overview';
  const [from, setFrom] = useState<Date | null>(null);
  const [status, setStatus] = useState('all');
  const [query, setQuery] = useState('');
  const [cmdOpen, setCmdOpen] = useState(false);
  const [newOpen, setNewOpen] = useState(false);
  const [name, setName] = useState('');

  const rows = useMemo(
    () => orders.filter((o) => (!from || o.date >= from) && (status === 'all' || o.status === status) && o.customer.toLowerCase().includes(query.toLowerCase())),
    [from, status, query],
  );
  const paid = rows.filter((o) => o.status === 'paid');
  const revenue = paid.reduce((s, o) => s + o.amount, 0);
  const byMonth = useMemo(() => {
    const m = new Map<string, number>();
    for (const o of [...paid].sort((a, b) => +a.date - +b.date)) {
      const k = o.date.toLocaleDateString('en-US', {month: 'short'});
      m.set(k, (m.get(k) ?? 0) + o.amount);
    }
    return [...m].map(([label, value]) => ({label, value}));
  }, [paid]);
  const byStatus = (['paid', 'pending', 'refunded'] as const).map((s) => ({label: statusLabel[s], value: rows.filter((o) => o.status === s).length}));

  return (
    <BlockDashboardShell
      brand={<strong>Acme Console</strong>}
      nav={[
        {label: 'Overview', href: '#overview', current: page === 'overview'},
        {label: 'Orders', href: '#orders', current: page === 'orders'},
      ]}
      topbar={
        <>
          <Button variant="line" size="sm" aria-haspopup="dialog" onClick={() => setCmdOpen(true)}>Search or run a command</Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="line" size="sm">Look</Button></DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Theme</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={theme} onValueChange={(v) => setTheme(v as Theme)}>
                {themes.map((t) => <DropdownMenuRadioItem key={t} value={t}>{t}</DropdownMenuRadioItem>)}
              </DropdownMenuRadioGroup>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Accent</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={accent} onValueChange={(v) => setAccent(v as Accent)}>
                {accents.map((a) => <DropdownMenuRadioItem key={a} value={a}>{a}</DropdownMenuRadioItem>)}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <Avatar name="Prashant D" />
        </>
      }
    >
      <Heading level={1} size="lg">{page === 'orders' ? 'Orders' : 'Overview'}</Heading>

      <div className="filters">
        <Field label="From">
          <DatePicker value={from} onValueChange={setFrom} placeholder="Any date" />
        </Field>
        <Field label="Customer"><Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name" /></Field>
        <SegmentedControl aria-label="Status" value={status} onValueChange={setStatus} options={[{value: 'all', label: 'All'}, {value: 'paid', label: 'Paid'}, {value: 'pending', label: 'Pending'}, {value: 'refunded', label: 'Refunded'}]} />
        {from && <Button variant="ghost" size="sm" onClick={() => setFrom(null)}>Clear date</Button>}
        <Button variant="solid" onClick={() => setNewOpen(true)}>New order</Button>
      </div>

      {page === 'overview' && (
        <>
          <Grid columns={4} gap={4} className="stats">
            <Stat label="Revenue" value={money(revenue)} note="Paid orders only" />
            <Stat label="Orders" value={rows.length} note={`${from ? 'Since ' + from.toLocaleDateString() : 'All time'}`} />
            <Stat label="Average order" value={money(paid.length ? Math.round(revenue / paid.length) : 0)} />
            <Stat label="Pending" value={rows.filter((o) => o.status === 'pending').length} note="Awaiting payment" />
          </Grid>
          <div className="charts">
            <Card><CardHeader><CardTitle>Revenue by month</CardTitle></CardHeader><CardContent><LineChart title="Revenue by month" data={byMonth} valueFormat={money} /></CardContent></Card>
            <Card><CardHeader><CardTitle>Orders by status</CardTitle></CardHeader><CardContent><BarChart title="Orders by status" data={byStatus} showValues /></CardContent></Card>
          </div>
        </>
      )}

      <DataTable label="Orders" columns={columns} data={rows} pageSize={8} defaultSort={{id: 'date', direction: 'desc'}} emptyTitle="No orders match" emptyDescription="Clear a filter to see more." />

      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent>
          <Form preventDefault onSubmit={() => { setNewOpen(false); toast('Order created', `Draft for ${name || 'a new customer'} saved.`); setName(''); }}>
            <DialogHeader><DialogTitle>New order</DialogTitle><DialogDescription>Create a draft order for a customer.</DialogDescription></DialogHeader>
            <Field label="Customer name" required><Input value={name} onChange={(e) => setName(e.target.value)} /></Field>
            <DialogFooter><Button type="button" variant="line" onClick={() => setNewOpen(false)}>Cancel</Button><Button type="submit" variant="solid">Create</Button></DialogFooter>
          </Form>
        </DialogContent>
      </Dialog>

      <Command
        open={cmdOpen}
        onOpenChange={setCmdOpen}
        shortcut="mod+k"
        title="Command palette"
        items={[
          {id: 'ov', label: 'Go to Overview', group: 'Navigate', onSelect: () => setHash('overview')},
          {id: 'or', label: 'Go to Orders', group: 'Navigate', onSelect: () => setHash('orders')},
          {id: 'new', label: 'New order', group: 'Actions', hint: 'N', onSelect: () => setNewOpen(true)},
          ...themes.map((t) => ({id: 't-' + t, label: `Theme: ${t}`, group: 'Look', onSelect: () => setTheme(t)})),
          ...accents.map((a) => ({id: 'a-' + a, label: `Accent: ${a}`, group: 'Look', onSelect: () => setAccent(a)})),
        ]}
      />
    </BlockDashboardShell>
  );
}

export const App = () => <Toasts><Dashboard /></Toasts>;
