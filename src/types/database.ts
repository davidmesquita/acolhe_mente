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

export type AppointmentStatus = 'requested' | 'confirmed' | 'cancelled' | 'completed'
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]
export type SchedulerSettings = {
  price_cents: number
  duration_minutes: number
  cancellation_notice_hours: number
}
export type ProfessionalAvailability = {
  id: string
  professional_id: string
  weekday: number
  starts_at: string
  ends_at: string
  timezone: string
  created_at: string
  updated_at: string
}
export type ScheduleException = {
  id: string
  professional_id: string
  starts_at: string
  ends_at: string
  reason: string
  created_at: string
}
export type AppointmentSummary = {
  id: string
  starts_at: string
  ends_at: string
  price_cents: number
  duration_minutes: number
  status: AppointmentStatus
  other_party_name: string
  timezone: string | null
  professional_id: string
}
export type AvailableSlot = {
  starts_at: string
  ends_at: string
  timezone: string
  price_cents: number
  duration_minutes: number
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
      scheduler_settings: {
        Row: SchedulerSettings & { id: boolean; updated_at: string }
        Insert: Partial<SchedulerSettings> & { id?: boolean }
        Update: Partial<SchedulerSettings>
            Insert: never
            Update: never
      professional_availability: {
        Row: ProfessionalAvailability
        Insert: Omit<ProfessionalAvailability, 'id' | 'created_at' | 'updated_at'> & {
            Insert: never
            Update: never
      }
      schedule_exceptions: {
        Row: ScheduleException
        Insert: Omit<ScheduleException, 'id' | 'created_at'> & { id?: string }
        Update: Partial<Omit<ScheduleException, 'id' | 'professional_id' | 'created_at'>>
        Relationships: []
      }
      appointments: {
        Row: {
          id: string
          patient_id: string
          professional_id: string
          starts_at: string
          ends_at: string
          price_cents: number
          duration_minutes: number
          status: AppointmentStatus
          idempotency_key: string
          created_at: string
          updated_at: string
          cancelled_at: string | null
        }
        Insert: never
        Update: never
        Relationships: []
      }
    }
    Views: {
      verified_professional_profiles: {
        Row: VerifiedProfessional
        Relationships: []
      }
    }
    Functions: {
      get_scheduler_settings: {
        Args: Record<PropertyKey, never>
        Returns: SchedulerSettings[]
      }
      get_professional_timezone: {
        Args: { professional_uuid: string }
        Returns: string | null
      }
      save_professional_availability: {
        Args: { availability: Json }
        Returns: undefined
      }
      get_available_slots: {
        Args: { professional_uuid: string; local_date: string }
        Returns: AvailableSlot[]
      }
      request_appointment: {
        Args: { professional_uuid: string; slot_start: string; request_key: string }
        Returns: string
      }
      cancel_appointment: { Args: { appointment_uuid: string }; Returns: undefined }
      set_appointment_status: {
        Args: { appointment_uuid: string; next_status: AppointmentStatus }
        Returns: undefined
      }
      reschedule_appointment: {
        Args: { appointment_uuid: string; slot_start: string; request_key: string }
        Returns: string
      }
      get_my_appointments: { Args: Record<PropertyKey, never>; Returns: AppointmentSummary[] }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
