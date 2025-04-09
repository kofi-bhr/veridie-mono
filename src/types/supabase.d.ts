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
      consultants: {
        Row: {
          id: string
          slug: string
          user_id: string
          university: string
          headline: string
          image_url: string
          bio: string
          major: string[]
          accepted_schools: string[]
          is_verified?: boolean
          verified?: boolean
          sat_score?: number
          act_score?: number
          gpa?: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          user_id: string
          university: string
          headline?: string
          image_url?: string
          bio?: string
          major?: string[]
          accepted_schools?: string[]
          is_verified?: boolean
          verified?: boolean
          sat_score?: number
          act_score?: number
          gpa?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          user_id?: string
          university?: string
          headline?: string
          image_url?: string
          bio?: string
          major?: string[]
          accepted_schools?: string[]
          is_verified?: boolean
          verified?: boolean
          sat_score?: number
          act_score?: number
          gpa?: number
          created_at?: string
          updated_at?: string
        }
      }
      universities: {
        Row: {
          id: string
          name: string
          logo_url: string
          color_hex: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          logo_url: string
          color_hex?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          logo_url?: string
          color_hex?: string
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          user_id: string
          first_name: string
          last_name: string
          email: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          first_name: string
          last_name: string
          email: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          first_name?: string
          last_name?: string
          email?: string
          created_at?: string
          updated_at?: string
        }
      }
      awards: {
        Row: {
          id: string
          consultant_id: string
          title: string
          description: string
          year: string
          created_at: string
        }
        Insert: {
          id?: string
          consultant_id: string
          title: string
          description: string
          year: string
          created_at?: string
        }
        Update: {
          id?: string
          consultant_id?: string
          title?: string
          description?: string
          year?: string
          created_at?: string
        }
      }
      essays: {
        Row: {
          id: string
          consultant_id: string
          title: string
          preview: string
          content: string
          is_locked: boolean
          created_at: string
        }
        Insert: {
          id?: string
          consultant_id: string
          title: string
          preview: string
          content: string
          is_locked?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          consultant_id?: string
          title?: string
          preview?: string
          content?: string
          is_locked?: boolean
          created_at?: string
        }
      }
      extracurriculars: {
        Row: {
          id: string
          consultant_id: string
          title: string
          description: string
          role: string
          years: string[]
          created_at: string
        }
        Insert: {
          id?: string
          consultant_id: string
          title: string
          description: string
          role: string
          years: string[]
          created_at?: string
        }
        Update: {
          id?: string
          consultant_id?: string
          title?: string
          description?: string
          role?: string
          years?: string[]
          created_at?: string
        }
      }
      ap_scores: {
        Row: {
          id: string
          consultant_id: string
          subject: string
          score: number
          created_at: string
        }
        Insert: {
          id?: string
          consultant_id: string
          subject: string
          score: number
          created_at?: string
        }
        Update: {
          id?: string
          consultant_id?: string
          subject?: string
          score?: number
          created_at?: string
        }
      }
      packages: {
        Row: {
          id: string
          consultant_id: string
          title: string
          description: string
          price: number
          features: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          consultant_id: string
          title: string
          description: string
          price: number
          features: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          consultant_id?: string
          title?: string
          description?: string
          price?: number
          features?: string[]
          created_at?: string
          updated_at?: string
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
