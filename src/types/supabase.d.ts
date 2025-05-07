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
          subject: string;
          score: number | null;
          consultant_id: string | null;
          id: string;
          created_at: string | null;
        };
        Insert: {
          subject: string;
          score?: number | null;
          consultant_id?: string | null;
          id?: string;
          created_at?: string | null;
        };
        Update: {
          subject?: string;
          score?: number | null;
          consultant_id?: string | null;
          id?: string;
          created_at?: string | null;
        };
      };
      awards: {
        Row: {
          date: string;
          id: string;
          consultant_id: string | null;
          is_visible: boolean | null;
          created_at: string | null;
          scope: string | null;
          description: string | null;
          title: string;
        };
        Insert: {
          date: string;
          id?: string;
          consultant_id?: string | null;
          is_visible?: boolean | null;
          created_at?: string | null;
          scope?: string | null;
          description?: string | null;
          title: string;
        };
        Update: {
          date?: string;
          id?: string;
          consultant_id?: string | null;
          is_visible?: boolean | null;
          created_at?: string | null;
          scope?: string | null;
          description?: string | null;
          title?: string;
        };
      };
      booking_settings: {
        Row: {
          consultant_id: string | null;
          id: string;
          provider: string | null;
          booking_url: string | null;
          stripe_price_id: string | null;
          updated_at: string | null;
          created_at: string | null;
          price_per_hour: number | null;
          is_enabled: boolean | null;
        };
        Insert: {
          consultant_id?: string | null;
          id?: string;
          provider?: string | null;
          booking_url?: string | null;
          stripe_price_id?: string | null;
          updated_at?: string | null;
          created_at?: string | null;
          price_per_hour?: number | null;
          is_enabled?: boolean | null;
        };
        Update: {
          consultant_id?: string | null;
          id?: string;
          provider?: string | null;
          booking_url?: string | null;
          stripe_price_id?: string | null;
          updated_at?: string | null;
          created_at?: string | null;
          price_per_hour?: number | null;
          is_enabled?: boolean | null;
        };
      };
      bookings: {
        Row: {
          amount_total: number;
          amount_consultant: number | null;
          amount_platform: number | null;
          created_at: string | null;
          updated_at: string | null;
          stripe_session_id: string;
          stripe_payment_intent_id: string | null;
          status: string;
          payment_status: string;
          id: string;
          user_id: string;
          package_id: string;
          consultant_id: string | null;
        };
        Insert: {
          amount_total: number;
          amount_consultant?: number | null;
          amount_platform?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
          stripe_session_id: string;
          stripe_payment_intent_id?: string | null;
          status: string;
          payment_status: string;
          id?: string;
          user_id: string;
          package_id: string;
          consultant_id?: string | null;
        };
        Update: {
          amount_total?: number;
          amount_consultant?: number | null;
          amount_platform?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
          stripe_session_id?: string;
          stripe_payment_intent_id?: string | null;
          status?: string;
          payment_status?: string;
          id?: string;
          user_id?: string;
          package_id?: string;
          consultant_id?: string | null;
        };
      };
      consultants: {
        Row: {
          id: string;
          user_id: string | null;
          headline: string | null;
          university: string;
          major: string[] | null;
          image_url: string;
          gpa_scale: number | null;
          is_weighted: boolean | null;
          stripe_account_id: string | null;
          stripe_charges_enabled: boolean | null;
          stripe_onboarding_complete: boolean | null;
          sat_score: number | null;
          num_aps: number | null;
          created_at: string | null;
          updated_at: string | null;
          accepted_schools: string[] | null;
          sat_reading: number | null;
          sat_math: number | null;
          act_english: number | null;
          act_math: number | null;
          act_reading: number | null;
          act_science: number | null;
          act_composite: number | null;
          gpa_score: number | null;
          slug: string | null;
          contact_email: string | null;
          contact_phone: string | null;
          welcome_template: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          headline?: string | null;
          university: string;
          major?: string[] | null;
          image_url: string;
          gpa_scale?: number | null;
          is_weighted?: boolean | null;
          stripe_account_id?: string | null;
          stripe_charges_enabled?: boolean | null;
          stripe_onboarding_complete?: boolean | null;
          sat_score?: number | null;
          num_aps?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
          accepted_schools?: string[] | null;
          sat_reading?: number | null;
          sat_math?: number | null;
          act_english?: number | null;
          act_math?: number | null;
          act_reading?: number | null;
          act_science?: number | null;
          act_composite?: number | null;
          gpa_score?: number | null;
          slug?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          welcome_template?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          headline?: string | null;
          university?: string;
          major?: string[] | null;
          image_url?: string;
          gpa_scale?: number | null;
          is_weighted?: boolean | null;
          stripe_account_id?: string | null;
          stripe_charges_enabled?: boolean | null;
          stripe_onboarding_complete?: boolean | null;
          sat_score?: number | null;
          num_aps?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
          accepted_schools?: string[] | null;
          sat_reading?: number | null;
          sat_math?: number | null;
          act_english?: number | null;
          act_math?: number | null;
          act_reading?: number | null;
          act_science?: number | null;
          act_composite?: number | null;
          gpa_score?: number | null;
          slug?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          welcome_template?: string | null;
        };
      };
      essays: {
        Row: {
          id: string;
          content: string;
          prompt: string;
          created_at: string | null;
          is_visible: boolean | null;
          consultant_id: string | null;
        };
        Insert: {
          id?: string;
          content: string;
          prompt: string;
          created_at?: string | null;
          is_visible?: boolean | null;
          consultant_id?: string | null;
        };
        Update: {
          id?: string;
          content?: string;
          prompt?: string;
          created_at?: string | null;
          is_visible?: boolean | null;
          consultant_id?: string | null;
        };
      };
      extracurriculars: {
        Row: {
          is_visible: boolean | null;
          position_name: string;
          consultant_id: string | null;
          role: string | null;
          created_at: string | null;
          id: string;
          description: string | null;
          institution: string;
          years: string[];
        };
        Insert: {
          is_visible?: boolean | null;
          position_name: string;
          consultant_id?: string | null;
          role?: string | null;
          created_at?: string | null;
          id?: string;
          description?: string | null;
          institution: string;
          years: string[];
        };
        Update: {
          is_visible?: boolean | null;
          position_name?: string;
          consultant_id?: string | null;
          role?: string | null;
          created_at?: string | null;
          id?: string;
          description?: string | null;
          institution?: string;
          years?: string[];
        };
      };
      notifications: {
        Row: {
          updated_at: string | null;
          read: boolean | null;
          data: Json | null;
          user_id: string;
          title: string;
          id: string;
          message: string;
          type: string;
          created_at: string | null;
        };
        Insert: {
          updated_at?: string | null;
          read?: boolean | null;
          data?: Json | null;
          user_id: string;
          title: string;
          id?: string;
          message: string;
          type: string;
          created_at?: string | null;
        };
        Update: {
          updated_at?: string | null;
          read?: boolean | null;
          data?: Json | null;
          user_id?: string;
          title?: string;
          id?: string;
          message?: string;
          type?: string;
          created_at?: string | null;
        };
      };
      packages: {
        Row: {
          id: string;
          consultant_id: string | null;
          price: number;
          position: number;
          is_visible: boolean | null;
          billing_frequency: string;
          stripe_price_id: string | null;
          name: string;
          description: string | null;
          duration: number | null;
          is_active: boolean;
          stripe_product_id: string | null;
          features: string[];
          calendly_link: string | null;
        };
        Insert: {
          id?: string;
          consultant_id?: string | null;
          price: number;
          position: number;
          is_visible?: boolean | null;
          billing_frequency: string;
          stripe_price_id?: string | null;
          name: string;
          description?: string | null;
          duration?: number | null;
          is_active?: boolean;
          stripe_product_id?: string | null;
          features: string[];
          calendly_link?: string | null;
        };
        Update: {
          id?: string;
          consultant_id?: string | null;
          price?: number;
          position?: number;
          is_visible?: boolean | null;
          billing_frequency?: string;
          stripe_price_id?: string | null;
          name?: string;
          description?: string | null;
          duration?: number | null;
          is_active?: boolean;
          stripe_product_id?: string | null;
          features?: string[];
          calendly_link?: string | null;
        };
      };
      purchases: {
        Row: {
          id: string;
          user_id: string;
          package_id: string;
          consultant_id: string;
          stripe_payment_intent_id: string | null;
          status: string;
          created_at: string | null;
          updated_at: string | null;
          expires_at: string | null;
          contact_initiated: boolean | null;
          contact_initiated_at: string | null;
          calendly_scheduled: boolean | null;
          calendly_scheduled_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          package_id: string;
          consultant_id: string;
          stripe_payment_intent_id?: string | null;
          status: string;
          created_at?: string | null;
          updated_at?: string | null;
          expires_at?: string | null;
          contact_initiated?: boolean | null;
          contact_initiated_at?: string | null;
          calendly_scheduled?: boolean | null;
          calendly_scheduled_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          package_id?: string;
          consultant_id?: string;
          stripe_payment_intent_id?: string | null;
          status?: string;
          created_at?: string | null;
          updated_at?: string | null;
          expires_at?: string | null;
          contact_initiated?: boolean | null;
          contact_initiated_at?: string | null;
          calendly_scheduled?: boolean | null;
          calendly_scheduled_at?: string | null;
        };
      };
      profiles: {
        Row: {
          id: string;
          first_name: string | null;
          last_name: string | null;
          role: string;
          is_verified: boolean;
        };
        Insert: {
          id: string;
          first_name?: string | null;
          last_name?: string | null;
          role: string;
          is_verified: boolean;
        };
        Update: {
          id?: string;
          first_name?: string | null;
          last_name?: string | null;
          role?: string;
          is_verified?: boolean;
        };
      };
      services: {
        Row: {
          description: string | null;
          updated_at: string | null;
          created_at: string | null;
          is_active: boolean | null;
          duration_minutes: number | null;
          price: number;
          id: string;
          service_type: string;
          billing_interval: string | null;
          stripe_price_id: string | null;
          consultant_id: string | null;
          title: string;
        };
        Insert: {
          description?: string | null;
          updated_at?: string | null;
          created_at?: string | null;
          is_active?: boolean | null;
          duration_minutes?: number | null;
          price: number;
          id?: string;
          service_type: string;
          billing_interval?: string | null;
          stripe_price_id?: string | null;
          consultant_id?: string | null;
          title: string;
        };
        Update: {
          description?: string | null;
          updated_at?: string | null;
          created_at?: string | null;
          is_active?: boolean | null;
          duration_minutes?: number | null;
          price?: number;
          id?: string;
          service_type?: string;
          billing_interval?: string | null;
          stripe_price_id?: string | null;
          consultant_id?: string | null;
          title?: string;
        };
      };
      stripe_webhooks: {
        Row: {
          type: string;
          processed_at: string | null;
          created_at: string | null;
          data: Json;
          id: string;
        };
        Insert: {
          type: string;
          processed_at?: string | null;
          created_at?: string | null;
          data: Json;
          id?: string;
        };
        Update: {
          type?: string;
          processed_at?: string | null;
          created_at?: string | null;
          data?: Json;
          id?: string;
        };
      };
      transfers: {
        Row: {
          amount: number;
          booking_id: string;
          consultant_id: string;
          failure_reason: string | null;
          status: string;
          id: string;
          stripe_transfer_id: string;
          updated_at: string | null;
          created_at: string | null;
        };
        Insert: {
          amount: number;
          booking_id: string;
          consultant_id: string;
          failure_reason?: string | null;
          status: string;
          id?: string;
          stripe_transfer_id: string;
          updated_at?: string | null;
          created_at?: string | null;
        };
        Update: {
          amount?: number;
          booking_id?: string;
          consultant_id?: string;
          failure_reason?: string | null;
          status?: string;
          id?: string;
          stripe_transfer_id?: string;
          updated_at?: string | null;
          created_at?: string | null;
        };
      };
      universities: {
        Row: {
          id: string;
          logo_url: string;
          color_hex: string;
          created_at: string | null;
          name: string;
        };
        Insert: {
          id?: string;
          logo_url: string;
          color_hex: string;
          created_at?: string | null;
          name: string;
        };
        Update: {
          id?: string;
          logo_url?: string;
          color_hex?: string;
          created_at?: string | null;
          name?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      validate_consultant_email: {
        Args: { email: string };
        Returns: boolean;
      };
      validate_calendly_link: {
        Args: { link: string };
        Returns: boolean;
      };
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
