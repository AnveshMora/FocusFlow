import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { registerSW } from 'virtual:pwa-register';
import App from './App';
import './styles/globals.css';

// Only register SW on non-localhost origins (ngrok, production)
// On localhost, unregister any stale SWs to avoid caching issues during dev/preview
if (location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
  registerSW({
    immediate: true,
    onRegisteredSW(swUrl) {
      console.log('[FocusFlow] Service worker registered:', swUrl);
    },
    onOfflineReady() {
      console.log('[FocusFlow] App ready to work offline');
    },
  });
} else {
  // Clean up any leftover SWs on localhost
  navigator.serviceWorker?.getRegistrations().then((regs) => {
    regs.forEach((r) => r.unregister());
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
