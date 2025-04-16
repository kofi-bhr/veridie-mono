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

// Mock Stripe checkout session creation
vi.mock('../config', () => ({
  stripe: {
    checkout: {
      sessions: {
        create: vi.fn().mockResolvedValue({
          id: 'cs_test_123',
          url: 'https://checkout.stripe.com/test',
        }),
      },
    },
    accounts: {
      retrieve: vi.fn().mockResolvedValue({
        id: 'acct_1R59Gb4TsoNqItar',
        charges_enabled: true,
        details_submitted: true,
      }),
    },
  },
}));

describe('Stripe Integration Tests', () => {
  let consultant: any;
  let pkg: any;

  beforeEach(async () => {
    // Create test consultant
    consultant = await createTestConsultant();
    // Create test package
    pkg = await createTestPackage(consultant.id);
  });

  afterEach(async () => {
    // Cleanup test data
    await cleanupTestData(consultant.id);
  });

  describe('Consultant Onboarding', () => {
    it('should verify consultant onboarding status', async () => {
      const account = await stripe.accounts.retrieve(consultant.stripe_account_id);
      expect(account.charges_enabled).toBe(true);
      expect(account.details_submitted).toBe(true);
    });
  });

  describe('Package Creation', () => {
    it('should create a package with Stripe product and price', async () => {
      expect(pkg).toBeDefined();
      expect(pkg.consultant_id).toBe(consultant.id);
      expect(pkg.stripe_product_id).toBe('prod_test');
      expect(pkg.stripe_price_id).toBe('price_test');
    });
  });

  describe('Checkout Flow', () => {
    it('should create a checkout session', async () => {
      const session = await createCheckoutSession({
        packageId: pkg.id,
        consultantId: consultant.id,
        successUrl: 'https://example.com/success',
        cancelUrl: 'https://example.com/cancel',
      });

      expect(session).toBeDefined();
      expect(session.id).toBe('cs_test_123');
      expect(session.url).toBe('https://checkout.stripe.com/test');
    });
  });

  describe('Webhook Handling', () => {
    it('should handle checkout.session.completed event', async () => {
      // Create the webhook event
      const event = await simulateWebhookEvent('checkout.session.completed', {
        id: 'cs_test_123',
        client_reference_id: pkg.id,
        customer: 'cus_test',
        payment_status: 'paid',
        metadata: {
          consultant_id: consultant.id,
        },
        amount_total: 10000,
        currency: 'usd',
      });

      // Handle the webhook event
      const result = await handleWebhookEvent(event);
      expect(result.success).toBe(true);
      expect(result.booking).toBeDefined();

      // Verify booking data
      const booking = result.booking;
      expect(booking.package_id).toBe(pkg.id);
      expect(booking.consultant_id).toBe(consultant.id);
      expect(booking.status).toBe('completed');
      expect(booking.payment_status).toBe('paid');
      expect(booking.stripe_session_id).toBe('cs_test_123');
    });
  });
}); 