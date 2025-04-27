import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createPackage, updatePackage, deletePackage } from '../packages';
import { createPurchase, getPurchaseDetails, updatePurchaseStatus } from '../purchases';
import { supabase } from '@/lib/supabase/client';
import Stripe from 'stripe';

// Mock Stripe
vi.mock('stripe', () => ({
  default: vi.fn(() => ({
    products: {
      create: vi.fn(),
      update: vi.fn(),
      del: vi.fn(),
    },
    prices: {
      create: vi.fn(),
      update: vi.fn(),
    },
    paymentIntents: {
      create: vi.fn(),
      update: vi.fn(),
    },
  })),
}));

describe('Package Management', () => {
  const mockPackageData = {
    title: 'Test Package',
    description: ['Feature 1', 'Feature 2'],
    price: 99.99,
    calendly_link: 'https://calendly.com/test',
    consultant_id: 'test-consultant-id',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a package with Stripe product and price', async () => {
    const mockStripeProduct = { id: 'prod_test' };
    const mockStripePrice = { id: 'price_test' };
    const stripe = new Stripe('test_key');

    vi.spyOn(stripe.products, 'create').mockResolvedValue(mockStripeProduct as any);
    vi.spyOn(stripe.prices, 'create').mockResolvedValue(mockStripePrice as any);
    vi.spyOn(supabase.from('packages'), 'insert').mockResolvedValue({ data: null, error: null });

    const result = await createPackage(mockPackageData);
    expect(result).toBeDefined();
    expect(stripe.products.create).toHaveBeenCalled();
    expect(stripe.prices.create).toHaveBeenCalled();
  });

  it('should update a package', async () => {
    const packageId = 'test-package-id';
    const updateData = {
      title: 'Updated Package',
      price: 149.99,
    };

    vi.spyOn(supabase.from('packages'), 'update').mockResolvedValue({ data: null, error: null });

    const result = await updatePackage(packageId, updateData);
    expect(result).toBeDefined();
    expect(supabase.from('packages').update).toHaveBeenCalledWith(updateData);
  });

  it('should delete a package', async () => {
    const packageId = 'test-package-id';
    
    vi.spyOn(supabase.from('packages'), 'delete').mockResolvedValue({ data: null, error: null });

    const result = await deletePackage(packageId);
    expect(result).toBeDefined();
    expect(supabase.from('packages').delete).toHaveBeenCalled();
  });
});

describe('Purchase Management', () => {
  const mockPurchaseData = {
    package_id: 'test-package-id',
    customer_id: 'test-customer-id',
    amount: 99.99,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a purchase with payment intent', async () => {
    const mockPaymentIntent = { id: 'pi_test', client_secret: 'test_secret' };
    const stripe = new Stripe('test_key');

    vi.spyOn(stripe.paymentIntents, 'create').mockResolvedValue(mockPaymentIntent as any);
    vi.spyOn(supabase.from('purchases'), 'insert').mockResolvedValue({ data: null, error: null });

    const result = await createPurchase(mockPurchaseData);
    expect(result).toBeDefined();
    expect(stripe.paymentIntents.create).toHaveBeenCalled();
  });

  it('should get purchase details', async () => {
    const purchaseId = 'test-purchase-id';
    const mockPurchase = {
      id: purchaseId,
      status: 'pending',
      ...mockPurchaseData,
    };

    vi.spyOn(supabase.from('purchases'), 'select').mockResolvedValue({ data: mockPurchase, error: null });

    const result = await getPurchaseDetails(purchaseId);
    expect(result).toBeDefined();
    expect(result).toEqual(mockPurchase);
  });

  it('should update purchase status', async () => {
    const purchaseId = 'test-purchase-id';
    const newStatus = 'completed';

    vi.spyOn(supabase.from('purchases'), 'update').mockResolvedValue({ data: null, error: null });

    const result = await updatePurchaseStatus(purchaseId, newStatus);
    expect(result).toBeDefined();
    expect(supabase.from('purchases').update).toHaveBeenCalledWith({ status: newStatus });
  });
});
