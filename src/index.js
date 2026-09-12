import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import './styles/prototype-parity.css';
import './styles/search-results-parity.css';
import './styles/saved-messages-parity.css';
import './styles/map-detail-parity.css';
import './styles/account-owner-parity.css';
import './styles/chat-owner-parity.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
