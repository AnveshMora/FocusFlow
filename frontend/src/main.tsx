import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { registerSW } from 'virtual:pwa-register';
import App from './App';
import './styles/globals.css';

// Register service worker for offline support
registerSW({
  immediate: true,
  onRegisteredSW(swUrl) {
    console.log('[FocusFlow] Service worker registered:', swUrl);
  },
  onOfflineReady() {
    console.log('[FocusFlow] App ready to work offline');
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
