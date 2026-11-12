import type {Demo} from '../../demo';
import {Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow} from './table';

export const demos: Demo[] = [
  {title: 'Basic', render: () => (
    <Table wrapperLabel="Team">
      <TableCaption>Team members</TableCaption>
      <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Role</TableHead><TableHead numeric>Projects</TableHead></TableRow></TableHeader>
      <TableBody>
        <TableRow><TableCell>Ada Lovelace</TableCell><TableCell>Engineer</TableCell><TableCell numeric>4</TableCell></TableRow>
        <TableRow><TableCell>Grace Hopper</TableCell><TableCell>Admiral</TableCell><TableCell numeric>9</TableCell></TableRow>
      </TableBody>
    </Table>
  )},
];
