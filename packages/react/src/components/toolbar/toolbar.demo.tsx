import type {Demo} from '../../demo';
import {Toolbar, ToolbarButton, ToolbarSeparator} from './toolbar';

export const demos: Demo[] = [
  {title: 'Text formatting', render: () => <Toolbar aria-label="Text formatting"><ToolbarButton>Bold</ToolbarButton><ToolbarButton>Italic</ToolbarButton><ToolbarButton>Underline</ToolbarButton><ToolbarSeparator /><ToolbarButton>Link</ToolbarButton></Toolbar>},
];
