import { vi, describe, it, expect, beforeEach } from 'vitest';
import { stripe } from '@/lib/stripe/config';
import { supabase } from '@/lib/supabase/client';
import { createPurchase, getPurchaseDetails, updatePurchaseStatus } from '@/lib/payments/purchases';

// Mock Stripe
vi.mock('@/lib/stripe/config', () => ({
  stripe: {
    paymentIntents: {
      create: vi.fn(),
      retrieve: vi.fn(),
    },
  },
}));

// Mock Supabase
vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(),
      })),
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

describe('Purchase Flow', () => {
  const mockPurchaseData = {
    package_id: 'test-package-id',
    user_id: 'test-user-id',
    consultant_id: 'test-consultant-id',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createPurchase', () => {
    it('creates a purchase with payment intent', async () => {
      // Mock Stripe payment intent creation
      (stripe.paymentIntents.create as jest.Mock).mockResolvedValue({
        id: 'pi_test123',
        client_secret: 'test_secret',
      });

      const result = await createPurchase(mockPurchaseData);

      expect(result.success).toBe(true);
      expect(result.client_secret).toBe('test_secret');
      expect(stripe.paymentIntents.create).toHaveBeenCalled();
    });

    it('handles payment intent creation failure', async () => {
      (stripe.paymentIntents.create as jest.Mock).mockRejectedValue(
        new Error('Payment intent creation failed')
      );

      const result = await createPurchase(mockPurchaseData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('getPurchaseDetails', () => {
    const mockPurchaseId = 'test-purchase-id';

    it('retrieves purchase with package and consultant details', async () => {
      // Mock Supabase query response
      (supabase.from as jest.Mock)().select().eq().single.mockResolvedValue({
        data: {
          id: mockPurchaseId,
          status: 'completed',
          package: {
            title: 'Test Package',
            calendly_link: 'https://calendly.com/test',
          },
          consultant: {
            contact_email: 'test@example.com',
          },
        },
        error: null,
      });

      const result = await getPurchaseDetails(mockPurchaseId);

      expect(result.success).toBe(true);
      expect(result.purchase).toBeDefined();
      expect(result.purchase?.package.calendly_link).toBe('https://calendly.com/test');
    });
  });

  describe('updatePurchaseStatus', () => {
    const mockPurchaseId = 'test-purchase-id';

    it('updates calendly scheduling status', async () => {
      const result = await updatePurchaseStatus(mockPurchaseId, {
        calendly_scheduled: true,
        calendly_scheduled_at: new Date().toISOString(),
      });

      expect(result.success).toBe(true);
      expect(supabase.from).toHaveBeenCalledWith('purchases');
    });

    it('updates contact initiation status', async () => {
      const result = await updatePurchaseStatus(mockPurchaseId, {
        contact_initiated: true,
        contact_initiated_at: new Date().toISOString(),
      });

      expect(result.success).toBe(true);
      expect(supabase.from).toHaveBeenCalledWith('purchases');
    });
  });
});
