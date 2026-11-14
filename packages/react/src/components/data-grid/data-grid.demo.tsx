import {useState} from 'react';
import type {Demo} from '../../demo';
import {DataGrid, type DataGridColumn} from './data-grid';

interface Order { id: string; customer: string; city: string; items: number; total: number }
const cities = ['Pune', 'Berlin', 'Lagos', 'Lima', 'Oslo', 'Hanoi', 'Cairo', 'Quito'];
const make = (count: number): Order[] => Array.from({length: count}, (_, i) => ({
  id: `ORD-${i + 1}`, customer: `Customer ${(i * 7919) % 10007}`, city: cities[i % cities.length]!, items: (i * 13) % 9 + 1, total: ((i * 2654435761) % 100000) / 100,
}));
const columns: DataGridColumn<Order>[] = [
  {id: 'id', header: 'Order', field: 'id', width: 120, sortable: true},
  {id: 'customer', header: 'Customer', field: 'customer', sortable: true},
  {id: 'city', header: 'City', field: 'city', sortable: true},
  {id: 'items', header: 'Items', field: 'items', width: 90, sortable: true, align: 'end'},
  {id: 'total', header: 'Total', cell: (r) => r.total.toFixed(2), sortValue: (r) => r.total, width: 110, sortable: true, align: 'end'},
];
const big = make(100000);
const small = make(12);

function Selectable() {
  const [ids, setIds] = useState<string[]>([]);
  return (
    <div>
      <DataGrid aria-label="Orders, selectable" columns={columns} rows={small} height={260} selectionMode="multiple" getRowId={(r) => r.id} selectedIds={ids} onSelectedIdsChange={setIds} />
      <p style={{fontSize: 'var(--text-sm)'}} role="status">{ids.length} selected</p>
    </div>
  );
}

export const demos: Demo[] = [
  {
    title: '100,000 rows',
    description: 'Only the visible rows are in the DOM. Click a header to sort, use the arrow keys, PageUp, PageDown, Ctrl+Home and Ctrl+End to move.',
    render: () => (
      <DataGrid
        aria-label="Orders, 100,000 rows"
        columns={columns}
        rows={big}
        height={320}
        getRowId={(r) => r.id}
      />
    ),
  },
  {
    title: 'Row selection',
    description: 'Space or a click toggles the focused row.',
    render: () => (
      <Selectable />
    ),
  },
  {
    title: 'Empty',
    render: () => (
      <DataGrid aria-label="No orders" columns={columns} rows={[]} height={200} />
    ),
  },
];
