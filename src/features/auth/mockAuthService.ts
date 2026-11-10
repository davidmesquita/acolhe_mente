import type { ProfessionalProfile, VerificationStatus } from '../../types/database'

const mockProfessionalProfile: ProfessionalProfile = {
  id: 'mock-psychologist-id',
  presentation: 'Psicóloga clínica com 10 anos de experiência em terapia cognitivo-comportamental e abordagem humanista. Atendimento acolhedor para ansiedade, depressão, relacionamentos e autoconhecimento.',
  specialties: ['Ansiedade', 'Depressão', 'Terapia Cognitivo-Comportamental', 'Relacionamentos'],
  registration_number: 'CRP 06/123456',
  verification_status: 'verified',
  accessibility_modalities: ['Legendas em tempo real', 'Comunicação por texto'],
  created_at: new Date().toISOString(),
}

let professionalProfileStore = { ...mockProfessionalProfile }

export async function getProfessionalProfile(_userId: string): Promise<ProfessionalProfile | null> {
  return { ...professionalProfileStore }
}

export async function saveProfessionalProfile(
  profile: Pick<
    ProfessionalProfile,
    'presentation' | 'specialties' | 'registration_number' | 'accessibility_modalities'
  >,
): Promise<ProfessionalProfile> {
  professionalProfileStore = {
    ...professionalProfileStore,
    ...profile,
    id: 'mock-psychologist-id',
  }
  return { ...professionalProfileStore }
}

export async function assignPsychologist(_userId: string) {
  // no-op in mock
}

export async function setProfessionalVerification(_userId: string, status: VerificationStatus) {
  if (_userId === 'mock-psychologist-id') {
    professionalProfileStore.verification_status = status
  }
}

export function resetMockProfessionalProfile() {
  professionalProfileStore = { ...mockProfessionalProfile }
}