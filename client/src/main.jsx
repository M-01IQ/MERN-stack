import { BrowserRouter } from 'react-router-dom';
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { CookiesProvider } from 'react-cookie';
import { ToastProvider } from "./Component/ui/ToastContext";
import { ConfirmProvider } from "./Component/ui/ConfirmContext";
import { AuthProvider } from "./context/AuthContext";
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <CookiesProvider>
        <AuthProvider>
          <ToastProvider>
            <ConfirmProvider>
              <App />
            </ConfirmProvider>
          </ToastProvider>
        </AuthProvider>
      </CookiesProvider>
    </BrowserRouter>
  </StrictMode>
)
