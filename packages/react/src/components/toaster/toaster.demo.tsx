import type {Demo} from '../../demo';
import {Button} from '../button';
import {Toaster, toast} from './toaster';

function Example() {
  return (
    <div style={{display: 'flex', gap: 8, flexWrap: 'wrap'}}>
      <Button onClick={() => toast('Draft saved')}>Default</Button>
      <Button onClick={() => toast.success('Profile updated', {description: 'Changes are live.'})}>Success</Button>
      <Button onClick={() => toast.error('Could not save', {description: 'Check your connection.', action: {label: 'Retry', onClick: () => toast.info('Retrying')}})}>Error with retry</Button>
      <Button onClick={() => toast.warning('Storage almost full')}>Warning</Button>
      <Button onClick={() => toast.promise(new Promise((r) => setTimeout(r, 1500)), {loading: 'Uploading', success: 'Uploaded', error: 'Upload failed'})}>Promise</Button>
      <Button variant="ghost" onClick={() => toast.dismiss()}>Dismiss all</Button>
      <Toaster />
    </div>
  );
}

export const demos: Demo[] = [{title: 'Call toast() from any handler', description: 'Mount one Toaster, then call toast anywhere. No provider or hook is needed.', render: () => <Example />}];
