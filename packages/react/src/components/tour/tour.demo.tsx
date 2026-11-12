import {useState} from 'react';
import type {Demo} from '../../demo';
import {Tour} from './tour';

function Basic() {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <div style={{display: 'flex', gap: 'var(--s4)', alignItems: 'center'}}>
        <button type="button" className="btn btn-solid" onClick={() => setOpen(true)}>Start tour</button>
        <button type="button" className="btn" id="tour-demo-a">Create</button>
        <button type="button" className="btn" id="tour-demo-b">Share</button>
      </div>
      <Tour
        open={open}
        onOpenChange={setOpen}
        steps={[
          {target: '#tour-demo-a', title: 'Create', content: 'Start a new project from here.'},
          {target: '#tour-demo-b', title: 'Share', content: 'Invite people by email.', placement: 'end'},
          {title: 'That is all', content: 'You can restart the tour at any time.'},
        ]}
      />
    </div>
  );
}

export const demos: Demo[] = [{title: 'Three steps', description: 'The last step has no target, so its card is centred.', render: () => <Basic />}];
