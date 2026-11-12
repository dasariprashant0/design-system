import type {Demo} from '../../demo';
import {Button} from '../../components/button';
import {useClipboard} from './use-clipboard';

function ClipboardDemo() {
  const {copied, error, copy} = useClipboard();
  return (
    <div>
      <Button variant="line" onClick={() => copy('npm install @monoline/react')}>
        {copied ? 'Copied' : 'Copy install command'}
      </Button>
      {error && <p role="status">Copy failed. Select the text and copy it yourself.</p>}
    </div>
  );
}

export const demos: Demo[] = [{title: 'Copy', description: 'The label changes for two seconds.', render: () => <ClipboardDemo />}];
