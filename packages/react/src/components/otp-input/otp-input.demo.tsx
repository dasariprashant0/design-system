import type {Demo} from '../../demo';
import {useState} from 'react';
import {OtpInput} from './otp-input';

function Demo() {
  const [done, setDone] = useState('');
  return <div style={{display: 'grid', gap: 'var(--s3)'}}><OtpInput aria-label="Verification code" onComplete={setDone} /><p className="muted small" role="status">{done ? `Entered ${done}` : 'Enter 6 digits'}</p></div>;
}

export const demos: Demo[] = [{
  title: 'Six digits',
  render: () => (
    <Demo />
  ),
}];
