import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { initMiddleware } from 'devise-axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import App from './App';
import AuthProvider from './providers/AuthProvider';

initMiddleware();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>
);
