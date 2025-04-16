import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { stripe } from '../config';
import { 
  supabaseTestClient, 
  createTestConsultant, 
  createTestPackage, 
  cleanupTestData,
  simulateWebhookEvent 
} from '../test-utils';
import { createCheckoutSession } from '../checkout';
import { handleWebhookEvent } from '../webhooks';
import { verifyOnboarding } from '../onboarding';

// Mock Stripe functions
vi.mock('../config', () => ({
  stripe: {
    accounts: {
      retrieve: vi.fn().mockResolvedValue({
        id: 'acct_test',
        charges_enabled: true,
        payouts_enabled: true,
        details_submitted: true,
      }),
    },
    checkout: {
      sessions: {
        create: vi.fn().mockResolvedValue({
          id: 'cs_test_123',
          url: 'https://checkout.stripe.com/test',
        }),
      },
    },
  },
}));

describe('Stripe Integration Tests', () => {
  let testConsultant: any;
  let testPackage: any;

  beforeEach(async () => {
    // Create test consultant
    testConsultant = await createTestConsultant();
    
    // Create test package
    testPackage = await createTestPackage(testConsultant.id);
    
    // Mock Stripe account retrieval
    (stripe.accounts.retrieve as any).mockResolvedValue({
      id: testConsultant.stripe_account_id,
      charges_enabled: true,
      payouts_enabled: true,
      details_submitted: true,
    });
    
    // Mock Stripe checkout session creation
    (stripe.checkout.sessions.create as any).mockResolvedValue({
      id: 'cs_test_123',
      url: 'https://checkout.stripe.com/test',
    });
  });

  afterEach(async () => {
    // Cleanup test data
    await cleanupTestData(testConsultant.id);
  });

  describe('Consultant Onboarding', () => {
    it('should verify onboarding status for a fully onboarded consultant', async () => {
      const result = await verifyOnboarding(testConsultant.id);
      expect(result).toBe(true);
    });

    it('should fail verification for a consultant with incomplete onboarding', async () => {
      // Mock Stripe to return incomplete onboarding status
      (stripe.accounts.retrieve as any).mockResolvedValueOnce({
        id: testConsultant.stripe_account_id,
        charges_enabled: false,
        payouts_enabled: false,
        details_submitted: false,
      });

      const result = await verifyOnboarding(testConsultant.id);
      expect(result).toBe(false);
    });
  });

  describe('Package Creation and Management', () => {
    it('should create a package successfully', async () => {
      expect(testPackage).toBeDefined();
      expect(testPackage.consultant_id).toBe(testConsultant.id);
      expect(testPackage.name).toBe('Test Package');
      expect(testPackage.price).toBe(10000);
    });

    it('should create a checkout session for a package', async () => {
      const session = await createCheckoutSession({
        packageId: testPackage.id,
        consultantId: testConsultant.id,
        successUrl: 'https://example.com/success',
        cancelUrl: 'https://example.com/cancel',
      });

      expect(session).toBeDefined();
      expect(session.id).toBe('cs_test_123');
      expect(session.url).toBe('https://checkout.stripe.com/test');
    });
  });

  describe('Webhook Handling', () => {
    it('should handle account.updated event', async () => {
      const event = await simulateWebhookEvent('account.updated', {
        id: testConsultant.stripe_account_id,
        charges_enabled: true,
        payouts_enabled: true,
      });

      const result = await handleWebhookEvent(event);
      expect(result.success).toBe(true);
    });

    it('should handle checkout.session.completed event', async () => {
      const event = await simulateWebhookEvent('checkout.session.completed', {
        id: 'cs_test_123',
        client_reference_id: testPackage.id,
        payment_status: 'paid',
        metadata: {
          consultant_id: testConsultant.id,
        },
        amount_total: 10000,
        currency: 'usd',
      });

      const result = await handleWebhookEvent(event);
      expect(result.success).toBe(true);
    });

    it('should handle invalid webhook events', async () => {
      const event = await simulateWebhookEvent('invalid.event', {});
      
      const result = await handleWebhookEvent(event);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle Stripe API errors gracefully', async () => {
      // Mock Stripe to throw an error
      (stripe.accounts.retrieve as any).mockRejectedValueOnce(new Error('Stripe API Error'));

      const result = await verifyOnboarding(testConsultant.id);
      expect(result).toBe(false);
    });

    it('should handle database errors gracefully', async () => {
      // Cleanup test data first
      await cleanupTestData(testConsultant.id);
      
      // Try to verify onboarding for non-existent consultant
      const result = await verifyOnboarding(testConsultant.id);
      expect(result).toBe(false);
    });
  });
}); 