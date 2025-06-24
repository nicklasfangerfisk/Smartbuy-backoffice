import React from 'react';
import { createRoot } from 'react-dom/client';
import App from '../App';

console.log('Mounting React app...');

const container = document.getElementById('root');
if (!container) {
  console.error('No #root element found in index.html!');
} else {
  const root = createRoot(container!);
  root.render(<App />);
  console.log('React app rendered!');
}
