'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Package } from '@/lib/payments/types';
import { Form, Input, Button } from '@/components/ui/neobrutalism';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { createPurchase } from '@/lib/payments/purchases';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

const checkoutSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  email: z.string().email({ message: 'Invalid email address' }),
  phone: z.string().min(10, { message: 'Phone number is required' }),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

interface CheckoutFormProps {
  package: Package;
}

export function CheckoutForm({ package: pkg }: CheckoutFormProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
  });

  const onSubmit = async (data: CheckoutFormData) => {
    try {
      setIsProcessing(true);

      // Create the purchase
      const result = await createPurchase({
        package_id: pkg.id,
        customer_name: data.name,
        customer_email: data.email,
        customer_phone: data.phone,
        amount: pkg.price,
        status: 'pending',
      });

      if (!result?.client_secret) {
        throw new Error('Failed to create payment intent');
      }

      // Initialize Stripe
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe failed to initialize');
      }

      // Redirect to Stripe Checkout
      const { error } = await stripe.confirmPayment({
        clientSecret: result.client_secret,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/${pkg.id}/success`,
          payment_method_data: {
            billing_details: {
              name: data.name,
              email: data.email,
              phone: data.phone,
            },
          },
        },
      });

      if (error) {
        throw error;
      }

    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to process payment. Please try again.',
      });
      setIsProcessing(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Alert>
          <AlertTitle>Secure Checkout</AlertTitle>
          <AlertDescription>
            Your payment will be processed securely through Stripe.
          </AlertDescription>
        </Alert>

        <Input
          label="Full Name"
          placeholder="John Doe"
          {...form.register('name')}
          error={form.formState.errors.name?.message}
        />

        <Input
          label="Email"
          type="email"
          placeholder="john@example.com"
          {...form.register('email')}
          error={form.formState.errors.email?.message}
        />

        <Input
          label="Phone"
          type="tel"
          placeholder="(123) 456-7890"
          {...form.register('phone')}
          error={form.formState.errors.phone?.message}
        />

        <Button
          type="submit"
          disabled={isProcessing}
          className="w-full"
        >
          {isProcessing ? 'Processing...' : `Pay $${pkg.price.toFixed(2)}`}
        </Button>

        <p className="text-sm text-center text-gray-500">
          By clicking Pay, you agree to our Terms of Service and Privacy Policy.
        </p>
      </form>
    </Form>
  );
}
