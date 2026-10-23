import { Route, Routes } from 'react-router-dom'
import { SiteLayout } from '../../components/layout/SiteLayout'
import { AppointmentsPage } from '../../features/appointments/AppointmentsPage'
import { AccessibilityPage } from '../../features/accessibility/AccessibilityPage'
import { AccountPage } from '../../features/auth/AccountPage'
import { HelpPage } from '../../features/help/HelpPage'
import { HomePage } from '../../features/home/HomePage'
import { NotFoundPage } from '../../features/home/NotFoundPage'
import { PatientDashboardPage } from '../../features/patient/PatientDashboardPage'
import { PsychologistDashboardPage } from '../../features/psychologist/PsychologistDashboardPage'
import { ProfessionalsPage } from '../../features/professionals/ProfessionalsPage'
import { ProfessionalProfilePage } from '../../features/professionals/ProfessionalProfilePage'
import { PrivacyPage } from '../../features/legal/PrivacyPage'
import { VideoSessionPage } from '../../features/video-session/VideoSessionPage'
import { ProtectedRoute } from './ProtectedRoute'
import { DemoPatientDashboardPage } from '../../features/patient/DemoPatientDashboardPage'
import { DemoPsychologistDashboardPage } from '../../features/psychologist/DemoPsychologistDashboardPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route index element={<HomePage />} />
        <Route path="/profissionais" element={<ProfessionalsPage />} />
        <Route path="/profissionais/:professionalId" element={<ProfessionalProfilePage />} />
        <Route path="/agendar" element={<AppointmentsPage />} />
        <Route path="/agendar/:professionalId" element={<AppointmentsPage />} />
        <Route path="/entrar" element={<AccountPage />} />
        <Route path="/cadastro" element={<AccountPage />} />
        <Route path="/esqueci-senha" element={<AccountPage />} />
        <Route path="/recuperar-senha" element={<AccountPage />} />
        <Route path="/demonstracao/paciente" element={<DemoPatientDashboardPage />} />
        <Route path="/demonstracao/psicologo" element={<DemoPsychologistDashboardPage />} />
        <Route element={<ProtectedRoute role="patient" />}>
          <Route path="/paciente" element={<PatientDashboardPage />} />
        </Route>
        <Route element={<ProtectedRoute role="psychologist" />}>
          <Route path="/psicologo" element={<PsychologistDashboardPage />} />
        </Route>
        <Route path="/acessibilidade" element={<AccessibilityPage />} />
        <Route path="/ajuda" element={<HelpPage />} />
        <Route path="/privacidade" element={<PrivacyPage />} />
        <Route path="/sessao-online" element={<VideoSessionPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
