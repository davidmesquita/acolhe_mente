import { Route, Routes } from 'react-router-dom'
import { SiteLayout } from '../../components/layout/SiteLayout'
import { AppointmentsPage } from '../../features/appointments/AppointmentsPage'
import { HomePage } from '../../features/home/HomePage'
import { ProfessionalsPage } from '../../features/professionals/ProfessionalsPage'
import { VideoSessionPage } from '../../features/video-session/VideoSessionPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route index element={<HomePage />} />
        <Route path="/profissionais" element={<ProfessionalsPage />} />
        <Route path="/agendar" element={<AppointmentsPage />} />
        <Route path="/sessao-online" element={<VideoSessionPage />} />
        <Route path="*" element={<HomePage />} />
      </Route>
    </Routes>
  )
}
