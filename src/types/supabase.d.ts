export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      ap_scores: {
        Row: {
          id: string
          consultant_id: string | null
          subject: string
          score: number | null
          created_at: string | null
        }
        Insert: {
          id?: string
          consultant_id?: string | null
          subject: string
          score?: number | null
          created_at?: string | null
        }
        Update: {
          id?: string
          consultant_id?: string | null
          subject?: string
          score?: number | null
          created_at?: string | null
        }
      }
      awards: {
        Row: {
          id: string
          consultant_id: string | null
          title: string
          description: string | null
          is_visible: boolean | null
          created_at: string | null
          scope: string | null
          date: string
        }
        Insert: {
          id?: string
          consultant_id?: string | null
          title: string
          description?: string | null
          is_visible?: boolean | null
          created_at?: string | null
          scope?: string | null
          date: string
        }
        Update: {
          id?: string
          consultant_id?: string | null
          title?: string
          description?: string | null
          is_visible?: boolean | null
          created_at?: string | null
          scope?: string | null
          date?: string
        }
      }
      booking_settings: {
        Row: {
          id: string
          consultant_id: string | null
          is_enabled: boolean | null
          provider: string | null
          booking_url: string | null
          price_per_hour: number | null
          stripe_price_id: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          consultant_id?: string | null
          is_enabled?: boolean | null
          provider?: string | null
          booking_url?: string | null
          price_per_hour?: number | null
          stripe_price_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          consultant_id?: string | null
          is_enabled?: boolean | null
          provider?: string | null
          booking_url?: string | null
          price_per_hour?: number | null
          stripe_price_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      bookings: {
        Row: {
          id: string
          user_id: string
          package_id: string
          consultant_id: string | null
          stripe_session_id: string
          stripe_payment_intent_id: string
          status: string
          payment_status: string
          amount_total: number
          amount_consultant: number | null
          amount_platform: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          package_id: string
          consultant_id?: string | null
          stripe_session_id: string
          stripe_payment_intent_id: string
          status: string
          payment_status: string
          amount_total: number
          amount_consultant?: number | null
          amount_platform?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          package_id?: string
          consultant_id?: string | null
          stripe_session_id?: string
          stripe_payment_intent_id?: string
          status?: string
          payment_status?: string
          amount_total?: number
          amount_consultant?: number | null
          amount_platform?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      consultants: {
        Row: {
          id: string
          user_id: string | null
          university: string
          sat_score: number | null
          num_aps: number | null
          image_url: string
          created_at: string | null
          slug: string | null
          accepted_university_ids: string[] | null
          accepted_schools: string[] | null
          headline: string | null
          sat_reading: number | null
          sat_math: number | null
          act_english: number | null
          act_math: number | null
          act_reading: number | null
          act_science: number | null
          act_composite: number | null
          gpa_score: number | null
          gpa_scale: number | null
          is_weighted: boolean | null
          major: string[] | null
          stripe_account_id: string | null
          stripe_charges_enabled: boolean | null
          stripe_onboarding_complete: boolean | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          university: string
          sat_score?: number | null
          num_aps?: number | null
          image_url?: string
          created_at?: string | null
          slug?: string | null
          accepted_university_ids?: string[] | null
          accepted_schools?: string[] | null
          headline?: string | null
          sat_reading?: number | null
          sat_math?: number | null
          act_english?: number | null
          act_math?: number | null
          act_reading?: number | null
          act_science?: number | null
          act_composite?: number | null
          gpa_score?: number | null
          gpa_scale?: number | null
          is_weighted?: boolean | null
          major?: string[] | null
          stripe_account_id?: string | null
          stripe_charges_enabled?: boolean | null
          stripe_onboarding_complete?: boolean | null
        }
        Update: {
          id?: string
          user_id?: string | null
          university?: string
          sat_score?: number | null
          num_aps?: number | null
          image_url?: string
          created_at?: string | null
          slug?: string | null
          accepted_university_ids?: string[] | null
          accepted_schools?: string[] | null
          headline?: string | null
          sat_reading?: number | null
          sat_math?: number | null
          act_english?: number | null
          act_math?: number | null
          act_reading?: number | null
          act_science?: number | null
          act_composite?: number | null
          gpa_score?: number | null
          gpa_scale?: number | null
          is_weighted?: boolean | null
          major?: string[] | null
          stripe_account_id?: string | null
          stripe_charges_enabled?: boolean | null
          stripe_onboarding_complete?: boolean | null
        }
      }
      essays: {
        Row: {
          id: string
          consultant_id: string | null
          prompt: string
          content: string
          is_visible: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          consultant_id?: string | null
          prompt: string
          content: string
          is_visible?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          consultant_id?: string | null
          prompt?: string
          content?: string
          is_visible?: boolean | null
          created_at?: string | null
        }
      }
      extracurriculars: {
        Row: {
          id: string
          consultant_id: string | null
          years: string[]
          position_name: string
          institution: string
          description: string | null
          is_visible: boolean | null
          created_at: string | null
          role: string | null
        }
        Insert: {
          id?: string
          consultant_id?: string | null
          years?: string[]
          position_name: string
          institution: string
          description?: string | null
          is_visible?: boolean | null
          created_at?: string | null
          role?: string | null
        }
        Update: {
          id?: string
          consultant_id?: string | null
          years?: string[]
          position_name?: string
          institution?: string
          description?: string | null
          is_visible?: boolean | null
          created_at?: string | null
          role?: string | null
        }
      }
      packages: {
        Row: {
          id: string
          consultant_id: string | null
          title: string
          price: number
          features: string[]
          position: number
          created_at: string | null
          is_visible: boolean | null
          billing_frequency: string
          stripe_price_id: string | null
          stripe_product_id: string | null
        }
        Insert: {
          id?: string
          consultant_id?: string | null
          title: string
          price: number
          features?: string[]
          position: number
          created_at?: string | null
          is_visible?: boolean | null
          billing_frequency: string
          stripe_price_id?: string | null
          stripe_product_id?: string | null
        }
        Update: {
          id?: string
          consultant_id?: string | null
          title?: string
          price?: number
          features?: string[]
          position?: number
          created_at?: string | null
          is_visible?: boolean | null
          billing_frequency?: string
          stripe_price_id?: string | null
          stripe_product_id?: string | null
        }
      }
      profiles: {
        Row: {
          id: string
          first_name: string | null
          last_name: string | null
          is_verified: boolean
          role: string
        }
        Insert: {
          id: string
          first_name?: string | null
          last_name?: string | null
          is_verified?: boolean
          role?: string
        }
        Update: {
          id?: string
          first_name?: string | null
          last_name?: string | null
          is_verified?: boolean
          role?: string
        }
      }
      services: {
        Row: {
          id: string
          consultant_id: string | null
          title: string
          description: string | null
          price: number
          duration_minutes: number | null
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
          stripe_price_id: string | null
          service_type: string
          billing_interval: string | null
        }
        Insert: {
          id?: string
          consultant_id?: string | null
          title: string
          description?: string | null
          price: number
          duration_minutes?: number | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
          stripe_price_id?: string | null
          service_type: string
          billing_interval?: string | null
        }
        Update: {
          id?: string
          consultant_id?: string | null
          title?: string
          description?: string | null
          price?: number
          duration_minutes?: number | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
          stripe_price_id?: string | null
          service_type?: string
          billing_interval?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
