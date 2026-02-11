import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from './contexts/ThemeContext.jsx'
import Notifications from './components/UIHelper/Notifications.jsx'
import AppRouter from "./app/router"

// Global Styles
import './App.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <AppRouter />
      <Notifications />
    </ThemeProvider>
  </StrictMode>,
)
