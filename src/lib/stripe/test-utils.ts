import { createClient } from '@supabase/supabase-js';
import { stripe } from './config';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseTestClient = createClient(supabaseUrl, supabaseServiceKey);

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
      stripe_account_id: TEST_STRIPE_ACCOUNT_ID,
      headline: 'Test Consultant',
      university: 'Test University',
      image_url: 'https://example.com/test.jpg',
      major: ['Computer Science'],
      slug: `test-consultant-${Date.now()}`,
      sat_score: 1500,
      num_aps: 5,
      created_at: new Date().toISOString()
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
  const payload = JSON.stringify({
    type,
    data: {
      object: data,
    },
  });

  const secret = 'whsec_test_secret';
  const timestamp = Math.floor(Date.now() / 1000);
  const signedPayload = `${timestamp}.${payload}`;
  const signature = crypto
    .createHmac('sha256', secret)
    .update(signedPayload)
    .digest('hex');

  return {
    body: payload,
    headers: {
      'stripe-signature': `t=${timestamp},v1=${signature}`,
    },
  };
} 