import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { LanguageProvider } from './contexts/LanguageContext';

// Suppress ResizeObserver loop errors which are often benign in React Flow and Resizable components
const resizeObserverLoopErr = /ResizeObserver loop limit exceeded|ResizeObserver loop completed with undelivered notifications/;
const originalOnError = window.onerror;
window.onerror = (msg, url, line, col, error) => {
  if (resizeObserverLoopErr.test(msg as string)) {
    return true; // Stop propagation
  }
  if (originalOnError) {
    return originalOnError(msg, url, line, col, error);
  }
  return false;
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </React.StrictMode>
);