import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { CheckoutForm } from '@/components/checkout/CheckoutForm';
import { Package } from '@/lib/payments/types';

export const metadata: Metadata = {
  title: 'Checkout | Veridie',
  description: 'Complete your purchase',
};

interface CheckoutPageProps {
  params: {
    packageId: string;
  };
}

async function getPackageDetails(packageId: string) {
  const supabase = createServerComponentClient({ cookies });

  const { data: pkg, error } = await supabase
    .from('packages')
    .select(`
      *,
      consultants:consultant_id (
        user_id,
        stripe_account_id,
        stripe_charges_enabled
      )
    `)
    .eq('id', packageId)
    .single();

  if (error || !pkg) {
    return null;
  }

  return pkg;
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const pkg = await getPackageDetails(params.packageId);

  if (!pkg || !pkg.is_active || !pkg.consultants?.stripe_charges_enabled) {
    notFound();
  }

  return (
    <main className="container max-w-4xl mx-auto py-8 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h1 className="text-3xl font-bold mb-6">Checkout</h1>
          <CheckoutForm package={pkg as Package} />
        </div>

        <div className="lg:sticky lg:top-4">
          <div className="rounded-lg border-2 border-black p-6 shadow-brutal">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">{pkg.title}</h3>
                <ul className="mt-2 space-y-2">
                  {pkg.description.map((item: string, index: number) => (
                    <li key={index} className="flex items-start text-sm">
                      <span className="mr-2">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t-2 border-black pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total</span>
                  <span className="text-2xl font-bold">
                    ${pkg.price.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
