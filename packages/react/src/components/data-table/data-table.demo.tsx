import type {Demo} from '../../demo';
import {DataTable, type DataTableColumn} from './data-table';

interface Person {id: string; name: string; role: string; projects: number}
const people: Person[] = [
  ['Ada Lovelace', 'Engineer', 4], ['Grace Hopper', 'Admiral', 9], ['Alan Turing', 'Researcher', 6], ['Katherine Johnson', 'Mathematician', 7],
  ['Linus Torvalds', 'Maintainer', 12], ['Margaret Hamilton', 'Director', 5], ['Dennis Ritchie', 'Engineer', 3], ['Barbara Liskov', 'Professor', 8],
].map(([name, role, projects], i) => ({id: String(i), name: name as string, role: role as string, projects: projects as number}));

const columns: DataTableColumn<Person>[] = [
  {id: 'name', header: 'Name', sortable: true},
  {id: 'role', header: 'Role', sortable: true},
  {id: 'projects', header: 'Projects', sortable: true, align: 'end'},
];

interface Order {id: string; customer: string; date: Date}
const orders: Order[] = [['Ada', '2026-03-02'], ['Grace', '2026-01-15'], ['Alan', '2026-02-20']].map(([customer, d], i) => ({id: String(i), customer: customer as string, date: new Date(`${d}T12:00:00Z`)}));
const dateColumns: DataTableColumn<Order>[] = [
  {id: 'customer', header: 'Customer', sortable: true},
  // accessor returns the Date, so sorting is by time; cell formats it for display
  {id: 'date', header: 'Date', sortable: true, accessor: (o) => o.date, cell: (o) => o.date.toLocaleDateString('en-GB', {day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC'})},
];

export const demos: Demo[] = [
  {
    title: 'Sortable',
    render: () => (
      <DataTable
        label="Team"
        columns={columns}
        data={people}
        defaultSort={{id: 'name', direction: 'asc'}}
      />
    ),
  },
  {
    title: 'Selectable with pages',
    render: () => (
      <DataTable label="Team, paged" columns={columns} data={people} selectable pageSize={4} />
    ),
  },
  {
    title: 'Empty',
    render: () => (
      <DataTable
        label="Empty team"
        columns={columns}
        data={[]}
        emptyTitle="No people yet"
        emptyDescription="Invite someone to see them here."
      />
    ),
  },
  {
    title: 'Sort by date',
    description: 'accessor returns the Date to sort by; cell formats it for display.',
    render: () => (
      <DataTable label="Orders" columns={dateColumns} data={orders} defaultSort={{id: 'date', direction: 'desc'}} />
    ),
  },
];
