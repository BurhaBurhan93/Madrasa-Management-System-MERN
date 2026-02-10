import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from './contexts/ThemeContext.jsx'

import App from './App.jsx'
import Notifications from './components/UIHelper/Notifications.jsx'

// Import CSS
import './App.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <App />
      <Notifications />
    </ThemeProvider>
  </StrictMode>,
)
