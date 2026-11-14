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
];
