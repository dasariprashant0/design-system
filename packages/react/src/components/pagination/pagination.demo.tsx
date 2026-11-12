import {useState} from 'react';
import type {Demo} from '../../demo';
import {Pagination} from './pagination';

function Demo1() {
  const [page, setPage] = useState(5);
  return <Pagination page={page} pageCount={20} onPageChange={setPage} />;
}
export const demos: Demo[] = [{title: 'With gaps', render: () => <Demo1 />}];
