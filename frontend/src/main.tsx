import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initializeApi } from './api'
import { env } from './config/env.ts'

initializeApi({
  baseURL: env.apiBaseUrl,
  refreshEndpoint: env.authRefreshEndpoint,
  withCredentials: true,
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
