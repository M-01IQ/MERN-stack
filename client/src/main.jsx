import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { CookiesProvider } from 'react-cookie';
import { AuthProvider } from './context/AuthContext' // استيراد الـ Provider
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CookiesProvider>
      <AuthProvider>
      <App />
    </AuthProvider>
    </CookiesProvider>
  </StrictMode>,
)
