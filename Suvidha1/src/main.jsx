import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { NotificationsProvider } from './context/NotificationsContext.jsx'
import { BookingsProvider } from './context/BookingsContext.jsx'
import "leaflet/dist/leaflet.css";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <NotificationsProvider>
      <BookingsProvider>
        <App />
      </BookingsProvider>
    </NotificationsProvider>
  </StrictMode>,
)
