import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './app/App'
import { AccessibilityProvider } from './app/providers/AccessibilityProvider'
import './styles/global.css'
import './styles/portal.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AccessibilityProvider>
      <App />
    </AccessibilityProvider>
  </React.StrictMode>,
)
