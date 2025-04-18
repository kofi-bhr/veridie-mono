import { createClient } from '@supabase/supabase-js';
import { stripe } from './config';

// Create a test client with the service role key
export const supabaseTestClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Mock data store
const mockDb = {
  consultants: new Map(),
  packages: new Map(),
  bookings: new Map(),
};

// Test Stripe account ID
export const TEST_STRIPE_ACCOUNT_ID = 'acct_test';

export async function createTestConsultant() {
  const { data: consultant, error } = await supabaseTestClient
    .from('consultants')
    .insert({
      user_id: 'test-user',
      stripe_account_id: TEST_STRIPE_ACCOUNT_ID,
      headline: 'Test Consultant',
      university: 'Test University',
      major: ['Test Major'],
      sat_score: 1600,
      num_aps: 10,
      slug: `test-consultant-${Date.now()}`,
      image_url: 'https://example.com/image.jpg',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      stripe_charges_enabled: false,
      stripe_onboarding_complete: false,
      is_weighted: false,
      gpa_scale: 4.0,
      gpa_score: 4.0,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return consultant;
}

export async function createTestPackage(consultantId: string) {
  // Verify consultant exists
  const { data: consultant, error: consultantError } = await supabaseTestClient
    .from('consultants')
    .select()
    .eq('id', consultantId)
    .single();

  if (consultantError || !consultant) {
    throw new Error('Consultant not found');
  }

  const { data: pkg, error } = await supabaseTestClient
    .from('packages')
    .insert({
      consultant_id: consultantId,
      name: 'Test Package',
      description: 'Test package description',
      price: 10000,
      duration: 60,
      billing_frequency: 'monthly',
      stripe_product_id: 'prod_test',
      stripe_price_id: 'price_test',
      is_active: true,
      position: 1,
      is_visible: true,
      features: ['Feature 1', 'Feature 2'],
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return pkg;
}

export async function cleanupTestData(consultantId: string) {
  // Delete all related data for the consultant
  await supabaseTestClient
    .from('bookings')
    .delete()
    .eq('consultant_id', consultantId);

  await supabaseTestClient
    .from('packages')
    .delete()
    .eq('consultant_id', consultantId);

  await supabaseTestClient
    .from('consultants')
    .delete()
    .eq('id', consultantId);

  // Clear the mock database
  mockDb.bookings.clear();
  mockDb.packages.clear();
  mockDb.consultants.clear();
}

export async function simulateWebhookEvent(type: string, data: any) {
  const timestamp = Math.floor(Date.now() / 1000);
  const payload = {
    id: `evt_test_${Date.now()}`,
    object: 'event',
    api_version: '2020-08-27',
    created: timestamp,
    data: {
      object: data,
    },
    livemode: false,
    pending_webhooks: 0,
    request: {
      id: null,
      idempotency_key: null,
    },
    type,
  };

  // Generate a test signature
  const secret = process.env.STRIPE_WEBHOOK_SECRET || 'test_secret';
  const signature = stripe.webhooks.generateTestHeaderValue({
    payload: JSON.stringify(payload),
    secret,
    timestamp,
  });

  return {
    payload,
    signature,
  };
} 