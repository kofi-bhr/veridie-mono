import { stripe } from './config';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

// Mock data store
const mockDb = {
  consultants: new Map(),
  packages: new Map(),
  bookings: new Map(),
};

// Mock Supabase client
export const supabaseTestClient = {
  from: (table: string) => ({
    insert: (data: any) => ({
      select: () => ({
        single: async () => {
          const id = uuidv4();
          const record = { id, ...data };
          mockDb[table].set(id, record);
          return { data: record, error: null };
        },
      }),
    }),
    select: (columns: string = '*') => ({
      eq: (column: string, value: string) => ({
        single: async () => {
          for (const [_, record] of mockDb[table].entries()) {
            if (record[column] === value) {
              return { data: record, error: null };
            }
          }
          return { data: null, error: null };
        },
        all: async () => {
          const records = [];
          for (const [_, record] of mockDb[table].entries()) {
            if (record[column] === value) {
              records.push(record);
            }
          }
          return { data: records, error: null };
        },
      }),
    }),
    delete: () => ({
      eq: async (column: string, value: string) => {
        const toDelete = [];
        for (const [id, record] of mockDb[table].entries()) {
          if (record[column] === value) {
            toDelete.push(id);
          }
        }
        toDelete.forEach(id => mockDb[table].delete(id));
        return { error: null };
      },
    }),
  }),
};

// Test Stripe account ID
export const TEST_STRIPE_ACCOUNT_ID = 'acct_1R59Gb4TsoNqItar';

export async function createTestConsultant() {
  const { data: consultant, error } = await supabaseTestClient
    .from('consultants')
    .insert({
      stripe_account_id: TEST_STRIPE_ACCOUNT_ID,
      onboarding_completed: true,
      charges_enabled: true,
      details_submitted: true,
      name: 'Test Consultant',
      email: 'test@example.com',
    })
    .select()
    .single();

  if (error) throw error;
  return consultant;
}

export async function createTestPackage(consultantId: string) {
  const { data: pkg, error } = await supabaseTestClient
    .from('packages')
    .insert({
      consultant_id: consultantId,
      name: 'Test Package',
      description: 'Test package description',
      price: 10000, // $100.00
      duration: 60, // 60 minutes
      billing_frequency: 'monthly',
      stripe_product_id: 'prod_test',
      stripe_price_id: 'price_test',
      is_active: true,
    })
    .select()
    .single();

  if (error) throw error;
  return pkg;
}

export async function cleanupTestData(consultantId: string) {
  // Delete database records
  await supabaseTestClient.from('bookings').delete().eq('consultant_id', consultantId);
  await supabaseTestClient.from('packages').delete().eq('consultant_id', consultantId);
  await supabaseTestClient.from('consultants').delete().eq('id', consultantId);

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