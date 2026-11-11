import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { ensureSeeded } from './services/seed';

import './styles/tokens.css';
import './styles/base.css';
import './styles/ui.css';
import './styles/layout.css';
import './styles/listings.css';
import './styles/pages.css';

const root = createRoot(document.getElementById('root'));

ensureSeeded()
  .catch((error) => {
    // The app still works without demo data; log for debugging.
    console.error('Could not prepare demo data', error);
  })
  .finally(() => {
    root.render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  });
