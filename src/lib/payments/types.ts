export interface Package {
  id: string;
  title: string;
  description: string[];
  price: number;
  calendly_link: string;
  consultant_id: string;
  stripe_price_id: string;
  stripe_product_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type PurchaseStatus = 
  | 'pending'
  | 'completed'
  | 'failed'
  | 'refunded';

export interface PurchaseData {
  package_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  amount: number;
  status: PurchaseStatus;
  stripe_payment_intent_id?: string;
}

export interface Purchase extends PurchaseData {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePackageData {
  title: string;
  description: string[];
  price: number;
  calendly_link: string;
  consultant_id: string;
}

export interface UpdatePackageData {
  title?: string;
  description?: string[];
  price?: number;
  calendly_link?: string;
  is_active?: boolean;
}

export interface CreatePurchaseData {
  package_id: string;
  customer_id: string;
  amount: number;
}
