import { vi, describe, it, expect, beforeEach } from 'vitest';
import { stripe } from '@/lib/stripe/config';
import { supabase } from '@/lib/supabase/client';
import { createPackage, updatePackage, deletePackage } from '@/lib/payments/packages';

// Mock Stripe
vi.mock('@/lib/stripe/config', () => ({
  stripe: {
    products: {
      create: vi.fn(),
      update: vi.fn(),
      del: vi.fn(),
    },
    prices: {
      create: vi.fn(),
      update: vi.fn(),
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
      update: vi.fn(() => ({
        eq: vi.fn(),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(),
      })),
    })),
  },
}));

describe('Package Management', () => {
  const mockPackageData = {
    title: 'Test Package',
    description: ['Point 1', 'Point 2'],
    price: 9999, // $99.99
    calendly_link: 'https://calendly.com/test/meeting',
    consultant_id: 'test-consultant-id',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createPackage', () => {
    it('creates a package with Stripe product and price', async () => {
      // Mock Stripe product creation
      (stripe.products.create as jest.Mock).mockResolvedValue({
        id: 'prod_test123',
      });

      // Mock Stripe price creation
      (stripe.prices.create as jest.Mock).mockResolvedValue({
        id: 'price_test123',
      });

      const result = await createPackage(mockPackageData);

      expect(result.success).toBe(true);
      expect(stripe.products.create).toHaveBeenCalledWith({
        name: mockPackageData.title,
        description: mockPackageData.description.join('\n'),
      });
      expect(stripe.prices.create).toHaveBeenCalledWith({
        product: 'prod_test123',
        unit_amount: mockPackageData.price,
        currency: 'usd',
      });
    });

    it('requires calendly link', async () => {
      const invalidData = { ...mockPackageData, calendly_link: '' };
      const result = await createPackage(invalidData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Calendly link is required');
    });

    it('validates price is positive', async () => {
      const invalidData = { ...mockPackageData, price: -100 };
      const result = await createPackage(invalidData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Price must be positive');
    });
  });

  describe('updatePackage', () => {
    const mockPackageId = 'test-package-id';
    const mockUpdateData = {
      title: 'Updated Package',
      description: ['New Point 1', 'New Point 2'],
      price: 19999, // $199.99
      calendly_link: 'https://calendly.com/test/meeting-updated',
    };

    it('updates package details and Stripe product', async () => {
      // Mock Stripe product update
      (stripe.products.update as jest.Mock).mockResolvedValue({
        id: 'prod_test123',
      });

      // Mock Stripe price creation (new price for updated amount)
      (stripe.prices.create as jest.Mock).mockResolvedValue({
        id: 'price_test456',
      });

      const result = await updatePackage(mockPackageId, mockUpdateData);

      expect(result.success).toBe(true);
      expect(stripe.products.update).toHaveBeenCalled();
      expect(stripe.prices.create).toHaveBeenCalled();
    });
  });

  describe('deletePackage', () => {
    const mockPackageId = 'test-package-id';

    it('archives Stripe product and deletes package record', async () => {
      // Mock successful deletion
      (stripe.products.del as jest.Mock).mockResolvedValue({});
      
      const result = await deletePackage(mockPackageId);

      expect(result.success).toBe(true);
      expect(stripe.products.del).toHaveBeenCalled();
    });
  });
});
