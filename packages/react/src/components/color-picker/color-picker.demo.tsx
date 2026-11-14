import {useState} from 'react';
import type {Demo} from '../../demo';
import {ColorPicker} from './color-picker';

function Controlled() {
  const [c, setC] = useState('#0090ff');
  return <div style={{maxWidth: '280px'}}><ColorPicker aria-label="Brand colour" value={c} onValueChange={setC} /><p>Chosen: {c}</p></div>;
}

export const demos: Demo[] = [
  {
    title: 'Presets, picker and hex',
    render: () => (
      <Controlled />
    ),
  },
  {
    title: 'Custom swatches',
    render: () => (
      <div style={{maxWidth: '280px'}}>
        <ColorPicker
          aria-label="Label colour"
          colors={['#e5484d', '#30a46c', '#0090ff']}
          defaultValue="#30a46c"
        />
      </div>
    ),
  },
];
