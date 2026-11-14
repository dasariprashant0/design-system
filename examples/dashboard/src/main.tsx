import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import '@monoline/css/core.css'; // tokens, themes, base; then one file per component this app uses
import '@monoline/css/components/avatar.css';
import '@monoline/css/components/badge.css';
import '@monoline/css/components/bar-chart.css';
import '@monoline/css/components/block-dashboard-shell.css';
import '@monoline/css/components/button.css';
import '@monoline/css/components/card.css';
import '@monoline/css/components/command.css';
import '@monoline/css/components/data-table.css';
import '@monoline/css/components/date-picker.css';
import '@monoline/css/components/dialog.css';
import '@monoline/css/components/dropdown-menu.css';
import '@monoline/css/components/field.css';
import '@monoline/css/components/form.css';
import '@monoline/css/components/grid.css';
import '@monoline/css/components/heading.css';
import '@monoline/css/components/input.css';
import '@monoline/css/components/line-chart.css';
import '@monoline/css/components/segmented-control.css';
import '@monoline/css/components/stat.css';
import '@monoline/css/components/text.css';
import '@monoline/css/components/toast.css';
import './app.css';
import {App} from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
