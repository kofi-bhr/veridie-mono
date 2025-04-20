import { createClient } from '@supabase/supabase-js';
import { stripe } from './config';
import crypto from 'crypto';
import type { Database } from '@/types/supabase';

// Create a test client with admin privileges
export const supabaseTestClient = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Mock data store
const mockDb = {
  consultants: new Map(),
  packages: new Map(),
  bookings: new Map(),
};

// Test constants
export const TEST_STRIPE_ACCOUNT_ID = 'acct_test123';
export const TEST_USER_ID = '00000000-0000-4000-8000-000000000000';

// Create a test user and return their ID
export async function createTestUser(email?: string) {
  const testEmail = email || `test${Date.now()}@example.com`;
  
  try {
    // First check if user exists
    const { data: existingUser } = await supabaseTestClient.auth.admin.listUsers();
    const existingTestUser = existingUser?.users.find(u => u.email === testEmail);
    
    if (existingTestUser) {
      // Delete existing user
      await supabaseTestClient.auth.admin.deleteUser(existingTestUser.id);
    }
    
    // Create new user
    const { data: { user }, error } = await supabaseTestClient.auth.admin.createUser({
      email: testEmail,
      password: 'testpassword123',
      email_confirm: true,
    });

    if (error) throw error;
    if (!user) throw new Error('Failed to create test user');

    return user.id;
  } catch (error) {
    console.error('Error creating test user:', error);
    throw error;
  }
}

// Create a test consultant and return their data
export async function createTestConsultant(userId?: string) {
  try {
    // Create test user if not provided
    const testUserId = userId || await createTestUser();
    
    // Create consultant profile
    const { data: consultant, error } = await supabaseTestClient
      .from('consultants')
      .insert({
        user_id: testUserId,
        headline: 'Test Headline',
        university: 'Test University',
        major: ['Computer Science'],
        image_url: 'test-image.jpg',
        sat_score: 1500,
        num_aps: 5,
        is_active: true,
        stripe_account_id: TEST_STRIPE_ACCOUNT_ID,
        stripe_charges_enabled: false,
        stripe_onboarding_complete: false,
        slug: `test-consultant-${Date.now()}`,
      })
      .select('*')
      .single();

    if (error) throw error;
    if (!consultant) throw new Error('Failed to create test consultant');

    return consultant;
  } catch (error) {
    console.error('Error creating test consultant:', error);
    throw error;
  }
}

// Create a test package and return its data
export async function createTestPackage(consultantId: string) {
  try {
    const { data: package_, error } = await supabaseTestClient
      .from('packages')
      .insert({
        consultant_id: consultantId,
        name: 'Test Package',
        description: 'Test package description',
        price: 10000,
        duration: 60,
        is_active: true,
        features: ['Feature 1', 'Feature 2'],
        stripe_price_id: 'price_test_123',
      })
      .select('*')
      .single();

    if (error) throw error;
    if (!package_) throw new Error('Failed to create test package');

    return package_;
  } catch (error) {
    console.error('Error creating test package:', error);
    throw error;
  }
}

// Clean up test data
export async function cleanupTestData(consultantId: string) {
  try {
    // Get consultant data to get user_id
    const { data: consultant } = await supabaseTestClient
      .from('consultants')
      .select('user_id')
      .eq('id', consultantId)
      .single();

    if (consultant?.user_id) {
      // Delete all related data
      await Promise.all([
        // Delete packages
        supabaseTestClient
          .from('packages')
          .delete()
          .eq('consultant_id', consultantId),
        
        // Delete bookings
        supabaseTestClient
          .from('bookings')
          .delete()
          .eq('consultant_id', consultantId),
          
        // Delete consultant
        supabaseTestClient
          .from('consultants')
          .delete()
          .eq('id', consultantId),
          
        // Delete user
        supabaseTestClient.auth.admin.deleteUser(consultant.user_id),
      ]);
    }
  } catch (error) {
    console.error('Error cleaning up test data:', error);
    throw error;
  }
}

// Simulate a webhook event
export async function simulateWebhookEvent(type: string, data: any) {
  const timestamp = Math.floor(Date.now() / 1000);
  const payload = JSON.stringify({
    id: `evt_test_${Date.now()}`,
    object: 'event',
    api_version: '2020-08-27',
    created: timestamp,
    type,
    data: {
      object: data,
    },
  });

  const secret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test';
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${timestamp}.${payload}`)
    .digest('hex');

  return {
    body: payload,
    headers: {
      'stripe-signature': `t=${timestamp},v1=${signature}`,
    },
  };
} 