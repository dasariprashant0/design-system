import type {Demo} from '../../demo';
import {useState} from 'react';
import {Calendar} from './calendar';

function Demo() {
  const [d, setD] = useState<Date | null>(null);
  return <div style={{display: 'grid', gap: 'var(--s3)', justifyItems: 'start'}}><Calendar value={d} onValueChange={setD} weekStartsOn={1} /><p className="muted small" role="status">{d ? d.toDateString() : 'No date picked'}</p></div>;
}

function Clearable() {
  const [d, setD] = useState<Date | null>(new Date());
  return <div style={{display: 'grid', gap: 'var(--s3)', justifyItems: 'start'}}><Calendar clearable value={d} onValueChange={setD} /><p className="muted small" role="status">{d ? d.toDateString() : 'No date picked'}</p></div>;
}

export const demos: Demo[] = [{title: 'Pick a date', render: () => <Demo />}, {title: 'Clearable', description: 'clearable adds a "Clear date" button; onValueChange receives null.', render: () => <Clearable />}];
