export type UserRole = 'patient' | 'psychologist' | 'admin'
export type VerificationStatus = 'pending' | 'verified' | 'rejected'

export type Profile = {
  id: string
  display_name: string
  role: UserRole
  created_at: string
}

export type ProfessionalProfile = {
  id: string
  presentation: string
  specialties: string[]
  registration_number: string | null
  verification_status: VerificationStatus
  accessibility_modalities: string[]
  created_at: string
}

export type VerifiedProfessional = {
  id: string
  display_name: string
  presentation: string
  specialties: string[]
  registration_number: string | null
  accessibility_modalities: string[]
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: { id: string; display_name: string; created_at?: string }
        Update: { display_name?: string }
        Relationships: []
      }
      professional_profiles: {
        Row: ProfessionalProfile
        Insert: {
          id: string
          presentation?: string
          specialties?: string[]
          registration_number?: string | null
          accessibility_modalities?: string[]
        }
        Update: {
          presentation?: string
          specialties?: string[]
          registration_number?: string | null
          accessibility_modalities?: string[]
        }
        Relationships: []
      }
    }
    Views: {
      verified_professional_profiles: {
        Row: VerifiedProfessional
        Relationships: []
      }
    }
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
