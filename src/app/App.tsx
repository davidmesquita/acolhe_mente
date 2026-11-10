import { BrowserRouter } from 'react-router-dom'
import { AppRoutes } from './routes/AppRoutes'
import { AuthProvider } from './providers/AuthProvider'
import { MockAuthProvider } from './providers/MockAuthProvider'
import { supabaseConfigured } from '../lib/supabaseClient'

export function App() {
  const useMock = !supabaseConfigured || import.meta.env.VITE_MOCK_AUTH === 'true'
  const Provider = useMock ? MockAuthProvider : AuthProvider
  return (
    <BrowserRouter>
      <Provider initialRole="patient">
        <AppRoutes />
      </Provider>
  </BrowserRouter>
  )
}
