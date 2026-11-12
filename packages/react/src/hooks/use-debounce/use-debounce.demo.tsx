import type {Demo} from '../../demo';
import {useState} from 'react';
import {useDebounce} from './use-debounce';

function SearchDemo() {
  const [query, setQuery] = useState('');
  const settled = useDebounce(query, 400);
  return (
    <div>
      <label>
        Search
        <input value={query} onChange={(e) => setQuery(e.target.value)} />
      </label>
      <p>Searching for: {settled || '…'}</p>
    </div>
  );
}

export const demos: Demo[] = [{title: 'Debounced value', description: 'Updates 400 ms after you stop typing.', render: () => <SearchDemo />}];
