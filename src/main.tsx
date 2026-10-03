import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { App } from './App';
import './config/api';
import './styles/index.css';

if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Analytics
        beforeSend={(event) => {
          if (new URL(event.url).pathname.startsWith('/admin')) {
            return null;
          }
          return event;
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
);
