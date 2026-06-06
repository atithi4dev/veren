import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initializeApi } from './api'

initializeApi({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8001/api/v1',
  refreshEndpoint: '/auth/refresh-token',
  withCredentials: true,
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
