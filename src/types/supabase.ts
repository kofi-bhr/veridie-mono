export {};

export interface ConsultantProfile {
  id?: string;
  user_id: string;
  headline: string;
  description?: string;
  image_url?: string;
  slug: string;
  university: string;
  major: string[];
  gpa_score?: number | null;
  gpa_scale?: number | null;
  is_weighted?: boolean;
  sat_reading?: number | null;
  sat_math?: number | null;
  act_composite?: number | null;
  accepted_schools?: string[];
  essays?: {
    prompt: string;
    content: string;
    is_visible: boolean;
    id?: string;
  }[];
  extracurriculars?: {
    name: string;
    position: string;
    description: string;
    start_year: number;
    end_year: number | null;
    is_current: boolean;
    id?: string;
  }[];
  awards?: {
    name: string;
    year: number;
    description: string;
    id?: string;
  }[];
  ap_scores?: {
    subject: string;
    score: number;
    id?: string;
  }[];
  packages?: {
    name: string;
    description: string;
    price: number;
    duration: string;
    is_featured: boolean;
    id?: string;
  }[];
  created_at?: string;
  updated_at?: string;
}

export interface Consultant {
  id: string;
  user_id: string;
  headline: string;
  description?: string;
  image_url?: string;
  slug: string;
  university: string;
  major: string[];
  stripe_account_id?: string | null;
  stripe_charges_enabled?: boolean;
  stripe_onboarding_complete?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface User {
  id: string;
  email?: string;
  created_at?: string;
}

// This is a simplified Database type definition
// In a real project, this would be generated from Supabase
export interface Database {
  public: {
    Tables: {
      consultants: {
        Row: ConsultantProfile;
        Insert: Omit<ConsultantProfile, 'id' | 'created_at' | 'updated_at'> & { user_id: string };
        Update: Partial<Omit<ConsultantProfile, 'id'>>;
      };
      users: {
        Row: User;
        Insert: Omit<User, 'id' | 'created_at'>;
        Update: Partial<Omit<User, 'id'>>;
      };
      packages: {
        Row: {
          id: string;
          consultant_id: string;
          name: string;
          description: string;
          price: number;
          duration: string;
          is_featured: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Insert: Omit<{
          id: string;
          consultant_id: string;
          name: string;
          description: string;
          price: number;
          duration: string;
          is_featured: boolean;
          created_at?: string;
          updated_at?: string;
        }, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<{
          id: string;
          consultant_id: string;
          name: string;
          description: string;
          price: number;
          duration: string;
          is_featured: boolean;
          created_at?: string;
          updated_at?: string;
        }, 'id'>>;
      };
      purchases: {
        Row: {
          id: string;
          user_id: string;
          package_id: string;
          consultant_id: string;
          status: string;
          payment_intent_id?: string;
          amount_total: number;
          contact_initiated: boolean;
          calendly_scheduled: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Insert: Omit<{
          id: string;
          user_id: string;
          package_id: string;
          consultant_id: string;
          status: string;
          payment_intent_id?: string;
          amount_total: number;
          contact_initiated: boolean;
          calendly_scheduled: boolean;
          created_at?: string;
          updated_at?: string;
        }, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<{
          id: string;
          user_id: string;
          package_id: string;
          consultant_id: string;
          status: string;
          payment_intent_id?: string;
          amount_total: number;
          contact_initiated: boolean;
          calendly_scheduled: boolean;
          created_at?: string;
          updated_at?: string;
        }, 'id'>>;
      };
    };
    Functions: Record<string, unknown>;
    Enums: Record<string, unknown>;
  };
}