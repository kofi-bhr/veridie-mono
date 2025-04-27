import { vi, describe, it, expect, beforeEach } from 'vitest';
import { stripe } from '@/lib/stripe/config';
import { createOnboardingLink, verifyOnboarding, reconnectStripeAccount } from '@/lib/stripe/onboarding';
import { supabase } from '@/lib/supabase/client';

// Mock Stripe
vi.mock('@/lib/stripe/config', () => ({
  stripe: {
    accounts: {
      create: vi.fn(),
      retrieve: vi.fn(),
    },
    accountLinks: {
      create: vi.fn(),
    },
  },
}));

// Mock Supabase
vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(),
      })),
    })),
  },
}));

describe('Stripe Connect Flow', () => {
  const mockConsultantId = 'test-consultant-id';
  const mockStripeAccountId = 'acct_test123';
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createOnboardingLink', () => {
    it('creates a new Stripe account and returns onboarding link', async () => {
      // Mock Stripe account creation
      (stripe.accounts.create as jest.Mock).mockResolvedValue({
        id: mockStripeAccountId,
      });

      // Mock account link creation
      (stripe.accountLinks.create as jest.Mock).mockResolvedValue({
        url: 'https://stripe.com/connect/onboarding',
      });

      const result = await createOnboardingLink(mockConsultantId);

      expect(result.success).toBe(true);
      expect(result.url).toBe('https://stripe.com/connect/onboarding');
      expect(stripe.accounts.create).toHaveBeenCalledWith({
        type: 'express',
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });
    });

    it('handles errors during account creation', async () => {
      (stripe.accounts.create as jest.Mock).mockRejectedValue(
        new Error('Failed to create account')
      );

      const result = await createOnboardingLink(mockConsultantId);

      expect(result.success).toBe(false);
      expect(result.url).toBeUndefined();
    });
  });

  describe('verifyOnboarding', () => {
    it('verifies a completed onboarding', async () => {
      // Mock Supabase consultant fetch
      (supabase.from as jest.Mock)().select().eq().single.mockResolvedValue({
        data: { stripe_account_id: mockStripeAccountId },
        error: null,
      });

      // Mock Stripe account retrieval
      (stripe.accounts.retrieve as jest.Mock).mockResolvedValue({
        charges_enabled: true,
        payouts_enabled: true,
        details_submitted: true,
      });

      const result = await verifyOnboarding(mockConsultantId);

      expect(result.success).toBe(true);
      expect(result.charges_enabled).toBe(true);
      expect(result.payouts_enabled).toBe(true);
      expect(result.details_submitted).toBe(true);
    });

    it('handles incomplete onboarding', async () => {
      (supabase.from as jest.Mock)().select().eq().single.mockResolvedValue({
        data: { stripe_account_id: mockStripeAccountId },
        error: null,
      });

      (stripe.accounts.retrieve as jest.Mock).mockResolvedValue({
        charges_enabled: false,
        payouts_enabled: false,
        details_submitted: false,
      });

      const result = await verifyOnboarding(mockConsultantId);

      expect(result.success).toBe(true);
      expect(result.charges_enabled).toBe(false);
      expect(result.payouts_enabled).toBe(false);
      expect(result.details_submitted).toBe(false);
    });
  });

  describe('reconnectStripeAccount', () => {
    it('creates new account and updates consultant record', async () => {
      // Mock Stripe account creation
      (stripe.accounts.create as jest.Mock).mockResolvedValue({
        id: 'new_' + mockStripeAccountId,
      });

      // Mock account link creation
      (stripe.accountLinks.create as jest.Mock).mockResolvedValue({
        url: 'https://stripe.com/connect/onboarding/new',
      });

      const result = await reconnectStripeAccount(mockConsultantId);

      expect(result.success).toBe(true);
      expect(result.url).toBe('https://stripe.com/connect/onboarding/new');
      expect(stripe.accounts.create).toHaveBeenCalled();
    });

    it('handles errors during reconnection', async () => {
      (stripe.accounts.create as jest.Mock).mockRejectedValue(
        new Error('Failed to create new account')
      );

      const result = await reconnectStripeAccount(mockConsultantId);

      expect(result.success).toBe(false);
      expect(result.url).toBeUndefined();
    });
  });
});
