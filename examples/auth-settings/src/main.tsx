import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import '@monoline/css/core.css'; // tokens, themes, base; then one file per component this app uses
import '@monoline/css/components/alert.css';
import '@monoline/css/components/alert-dialog.css';
import '@monoline/css/components/button.css';
import '@monoline/css/components/card.css';
import '@monoline/css/components/checkbox.css';
import '@monoline/css/components/field.css';
import '@monoline/css/components/file-upload.css';
import '@monoline/css/components/form.css';
import '@monoline/css/components/heading.css';
import '@monoline/css/components/input.css';
import '@monoline/css/components/link.css';
import '@monoline/css/components/native-select.css';
import '@monoline/css/components/password-input.css';
import '@monoline/css/components/select.css';
import '@monoline/css/components/stack.css';
import '@monoline/css/components/switch.css';
import '@monoline/css/components/tabs.css';
import '@monoline/css/components/text.css';
import '@monoline/css/components/textarea.css';
import '@monoline/css/components/toast.css';
import './app.css';
import {App} from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
