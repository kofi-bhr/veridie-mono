import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { stripe } from '../config';
import {
  createTestConsultant,
  createTestPackage,
  cleanupTestData,
  simulateWebhookEvent,
  TEST_STRIPE_ACCOUNT_ID,
  supabaseTestClient,
} from '../test-utils';
import { handleWebhook } from '../webhooks';
import { createCheckoutSession } from '../checkout';
import { verifyOnboardingStatus } from '../onboarding';

// Mock Stripe API calls
vi.mock('../config', () => ({
  stripe: {
    accounts: {
      retrieve: vi.fn(),
    },
    checkout: {
      sessions: {
        create: vi.fn(),
      },
    },
  },
}));

describe('Stripe Integration', () => {
  let consultantId: string;
  let packageId: string;

  beforeEach(async () => {
    // Reset all mocks
    vi.clearAllMocks();
  });

  afterEach(async () => {
    if (consultantId) {
      await cleanupTestData(consultantId);
    }
  });

  describe('Consultant Onboarding', () => {
    it('should verify onboarding status correctly', async () => {
      // Create test consultant
      const consultant = await createTestConsultant();
      consultantId = consultant.id;

      // Mock Stripe account retrieval
      vi.mocked(stripe.accounts.retrieve).mockResolvedValueOnce({
        charges_enabled: true,
        payouts_enabled: true,
        details_submitted: true,
      } as any);

      // Verify onboarding status
      const status = await verifyOnboardingStatus(consultantId);
      expect(status).toBe(true);

      // Verify Stripe API was called correctly
      expect(stripe.accounts.retrieve).toHaveBeenCalledWith(TEST_STRIPE_ACCOUNT_ID);
    });

    it('should handle inactive Stripe accounts', async () => {
      // Create test consultant
      const consultant = await createTestConsultant();
      consultantId = consultant.id;

      // Mock Stripe account retrieval for inactive account
      vi.mocked(stripe.accounts.retrieve).mockResolvedValueOnce({
        charges_enabled: false,
        payouts_enabled: false,
        details_submitted: false,
      } as any);

      // Verify onboarding status
      const status = await verifyOnboardingStatus(consultantId);
      expect(status).toBe(false);
    });

    it('should handle missing consultant', async () => {
      const status = await verifyOnboardingStatus('non-existent-id');
      expect(status).toBe(false);
    });

    it('should handle Stripe API errors', async () => {
      // Create test consultant
      const consultant = await createTestConsultant();
      consultantId = consultant.id;

      // Mock Stripe API error
      vi.mocked(stripe.accounts.retrieve).mockRejectedValueOnce(new Error('Stripe API error'));

      // Verify onboarding status
      const status = await verifyOnboardingStatus(consultantId);
      expect(status).toBe(false);
    });
  });

  describe('Package Creation', () => {
    it('should create a package successfully', async () => {
      // Create test consultant
      const consultant = await createTestConsultant();
      consultantId = consultant.id;

      // Create test package
      const package_ = await createTestPackage(consultantId);
      packageId = package_.id;

      expect(package_).toBeDefined();
      expect(package_.consultant_id).toBe(consultantId);
      expect(package_.is_active).toBe(true);
    });

    it('should handle inactive packages', async () => {
      // Create test consultant
      const consultant = await createTestConsultant();
      consultantId = consultant.id;

      // Create test package with is_active = false
      const { data: package_, error } = await supabaseTestClient
        .from('packages')
        .insert({
          consultant_id: consultantId,
          name: 'Inactive Package',
          description: 'Test inactive package',
          price: 10000,
          duration: 60,
          is_active: false,
          features: ['Feature 1'],
        })
        .select('*')
        .single();

      expect(error).toBeNull();
      expect(package_?.is_active).toBe(false);
    });
  });

  describe('Checkout Flow', () => {
    it('should create a checkout session successfully', async () => {
      // Create test consultant and package
      const consultant = await createTestConsultant();
      consultantId = consultant.id;
      const package_ = await createTestPackage(consultantId);
      packageId = package_.id;

      // Mock Stripe checkout session creation
      vi.mocked(stripe.checkout.sessions.create).mockResolvedValueOnce({
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/test',
      } as any);

      // Create checkout session
      const session = await createCheckoutSession({
        packageId: package_.id,
        consultantId: consultant.id,
        successUrl: 'http://localhost:3000/success',
        cancelUrl: 'http://localhost:3000/cancel',
      });

      expect(session).toBeDefined();
      expect(session.url).toBe('https://checkout.stripe.com/test');
      expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          payment_method_types: ['card'],
          line_items: [
            {
              price: package_.stripe_price_id,
              quantity: 1,
            },
          ],
          mode: 'payment',
          success_url: 'http://localhost:3000/success',
          cancel_url: 'http://localhost:3000/cancel',
          client_reference_id: package_.id,
          metadata: {
            consultant_id: consultant.id,
          },
        })
      );
    });

    it('should handle missing package', async () => {
      const consultant = await createTestConsultant();
      consultantId = consultant.id;

      await expect(createCheckoutSession({
        packageId: 'non-existent-package',
        consultantId: consultant.id,
        successUrl: 'http://localhost:3000/success',
        cancelUrl: 'http://localhost:3000/cancel',
      })).rejects.toThrow('Package not found');
    });

    it('should handle missing consultant', async () => {
      const consultant = await createTestConsultant();
      consultantId = consultant.id;
      const package_ = await createTestPackage(consultantId);
      packageId = package_.id;

      await expect(createCheckoutSession({
        packageId: package_.id,
        consultantId: 'non-existent-consultant',
        successUrl: 'http://localhost:3000/success',
        cancelUrl: 'http://localhost:3000/cancel',
      })).rejects.toThrow('Consultant not found');
    });
  });

  describe('Webhook Handling', () => {
    it('should handle account.updated webhook', async () => {
      // Create test consultant
      const consultant = await createTestConsultant();
      consultantId = consultant.id;

      // Simulate webhook event
      const event = await simulateWebhookEvent('account.updated', {
        id: TEST_STRIPE_ACCOUNT_ID,
        charges_enabled: true,
        details_submitted: true,
      });

      // Handle webhook
      const response = await handleWebhook(event);
      expect(response.success).toBe(true);

      // Verify consultant was updated
      const { data: updatedConsultant } = await supabaseTestClient
        .from('consultants')
        .select('*')
        .eq('id', consultantId)
        .single();

      expect(updatedConsultant?.stripe_charges_enabled).toBe(true);
      expect(updatedConsultant?.stripe_onboarding_complete).toBe(true);
    });

    it('should handle checkout.session.completed webhook', async () => {
      // Create test consultant and package
      const consultant = await createTestConsultant();
      consultantId = consultant.id;
      const package_ = await createTestPackage(consultantId);
      packageId = package_.id;

      // Simulate webhook event
      const event = await simulateWebhookEvent('checkout.session.completed', {
        id: 'cs_test_123',
        client_reference_id: packageId,
        metadata: {
          consultant_id: consultantId,
        },
        payment_status: 'paid',
        currency: 'usd',
        amount_total: 10000,
        customer: 'cus_test123',
      });

      // Handle webhook
      const response = await handleWebhook(event);
      expect(response.success).toBe(true);

      // Verify booking was created
      const { data: booking } = await supabaseTestClient
        .from('bookings')
        .select('*')
        .eq('package_id', packageId)
        .eq('stripe_session_id', 'cs_test_123')
        .single();

      expect(booking).toBeDefined();
      expect(booking?.status).toBe('completed');
      expect(booking?.payment_status).toBe('paid');
      expect(booking?.amount_total).toBe(10000);
      expect(booking?.currency).toBe('usd');
    });

    it('should handle invalid webhook events gracefully', async () => {
      const event = await simulateWebhookEvent('invalid.event', {});
      const response = await handleWebhook(event);
      expect(response.success).toBe(true); // Unknown events are handled gracefully
    });

    it('should handle malformed webhook data', async () => {
      const event = await simulateWebhookEvent('checkout.session.completed', {
        id: 'cs_test_123',
        // Missing required fields
      });

      const response = await handleWebhook(event);
      expect(response.success).toBe(false);
      expect(response.error).toBeDefined();
    });
  });
}); 