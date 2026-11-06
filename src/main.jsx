import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { LockerProvider } from './state/LockerContext.jsx';
import './styles/tokens.css';
import './styles/base.css';
import './styles/locker.css';
import './styles/layout.css';
import './styles/pages.css';
import './styles/notebook.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <LockerProvider>
        <App />
      </LockerProvider>
    </BrowserRouter>
  </StrictMode>,
);
