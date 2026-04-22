import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ComparisonProvider } from './context/ComparisonContext'
import { FavoritesProvider } from './context/FavoritesContext'
import './i18n'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ComparisonProvider>
          <FavoritesProvider>
            <App />
          </FavoritesProvider>
        </ComparisonProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
