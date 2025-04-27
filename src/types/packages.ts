import { Database } from './supabase';

export type Package = Database['public']['Tables']['packages']['Row'];
export type PackageInsert = Database['public']['Tables']['packages']['Insert'];
export type PackageUpdate = Database['public']['Tables']['packages']['Update'];

export type Purchase = Database['public']['Tables']['purchases']['Row'];
export type PurchaseInsert = Database['public']['Tables']['purchases']['Insert'];
export type PurchaseUpdate = Database['public']['Tables']['purchases']['Update'];

export type PurchaseStatus = 'pending' | 'completed' | 'refunded' | 'cancelled';

export interface PackageWithConsultant extends Package {
  consultant: {
    contact_email: string | null;
    contact_phone: string | null;
    welcome_template: string | null;
    user: {
      first_name: string | null;
      last_name: string | null;
    } | null;
  } | null;
}

export interface PurchaseWithDetails extends Purchase {
  package: Package;
  consultant: {
    contact_email: string | null;
    contact_phone: string | null;
    welcome_template: string | null;
    user: {
      first_name: string | null;
      last_name: string | null;
    } | null;
  };
}

export const DEFAULT_WELCOME_TEMPLATE = `Hi there!

Thank you for purchasing my package. I'm excited to work with you! 

Before we schedule our session through Calendly, I'd love to learn more about what you're hoping to achieve. Please reply to this email with:

1. Your main goals for our session
2. Any specific topics you'd like to cover
3. Your preferred time zone

Looking forward to our collaboration!

Best regards,
{{consultant_name}}`;
