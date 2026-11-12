import type {Demo} from '../../demo';
import {ResizableHandle, ResizablePanel, ResizablePanelGroup} from './resizable';

const box = {padding: 'var(--s4)', fontSize: 'var(--text-sm)'};

export const demos: Demo[] = [
  {title: 'Horizontal', description: 'Focus a handle and use the arrow keys, Home and End.', render: () => (
    <ResizablePanelGroup style={{height: '200px', border: '1px solid var(--rule)'}}>
      <ResizablePanel defaultSize={30} minSize={15}><div style={box}>Sidebar</div></ResizablePanel>
      <ResizableHandle aria-label="Resize sidebar" />
      <ResizablePanel defaultSize={70}><div style={box}>Content</div></ResizablePanel>
    </ResizablePanelGroup>
  )},
  {title: 'Vertical, three panels', render: () => (
    <ResizablePanelGroup direction="vertical" style={{height: '320px', border: '1px solid var(--rule)'}}>
      <ResizablePanel defaultSize={25}><div style={box}>Header</div></ResizablePanel>
      <ResizableHandle aria-label="Resize header" />
      <ResizablePanel defaultSize={50}><div style={box}>Body</div></ResizablePanel>
      <ResizableHandle aria-label="Resize footer" />
      <ResizablePanel defaultSize={25} minSize={10} maxSize={40}><div style={box}>Footer</div></ResizablePanel>
    </ResizablePanelGroup>
  )},
];
