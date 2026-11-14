import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import '@monoline/css/core.css'; // tokens, themes, base; then one file per component this app uses
import '@monoline/css/components/avatar.css';
import '@monoline/css/components/block-cta.css';
import '@monoline/css/components/block-feature-grid.css';
import '@monoline/css/components/block-footer.css';
import '@monoline/css/components/block-hero.css';
import '@monoline/css/components/block-pricing.css';
import '@monoline/css/components/block-testimonials.css';
import '@monoline/css/components/button.css';
import '@monoline/css/components/code-block.css';
import '@monoline/css/components/container.css';
import '@monoline/css/components/link.css';
import './app.css';
import {App} from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
