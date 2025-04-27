import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Button } from '@/components/ui/neobrutalism';
import { CheckCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Payment Successful | Veridie',
  description: 'Your payment has been processed successfully',
};

interface SuccessPageProps {
  params: {
    packageId: string;
  };
  searchParams: {
    payment_intent?: string;
    payment_intent_client_secret?: string;
  };
}

async function getPaymentDetails(paymentIntentId: string) {
  const supabase = createServerComponentClient({ cookies });

  const { data: purchase, error } = await supabase
    .from('purchases')
    .select(`
      *,
      packages:package_id (
        title,
        calendly_link
      )
    `)
    .eq('stripe_payment_intent_id', paymentIntentId)
    .single();

  if (error || !purchase) {
    return null;
  }

  return purchase;
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  if (!searchParams.payment_intent) {
    redirect('/');
  }

  const purchase = await getPaymentDetails(searchParams.payment_intent);
  if (!purchase) {
    redirect('/');
  }

  return (
    <main className="container max-w-2xl mx-auto py-12 px-4">
      <div className="text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>

        <h1 className="text-3xl font-bold">Payment Successful!</h1>
        
        <p className="text-xl">
          Thank you for purchasing {purchase.packages.title}
        </p>

        <div className="bg-white rounded-lg border-2 border-black p-6 shadow-brutal space-y-4">
          <h2 className="font-semibold">Next Steps:</h2>
          <ol className="list-decimal list-inside space-y-2 text-left">
            <li>Check your email for the payment confirmation</li>
            <li>Schedule your session using the Calendly link below</li>
            <li>Prepare any necessary materials for your consultation</li>
          </ol>
        </div>

        <div className="space-y-4">
          <a 
            href={purchase.packages.calendly_link}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <Button className="w-full">
              Schedule Your Session
            </Button>
          </a>

          <Link href="/dashboard" className="block">
            <Button variant="neutral" className="w-full">
              Go to Dashboard
            </Button>
          </Link>
        </div>

        <p className="text-sm text-gray-500">
          If you have any questions, please contact support@veridie.com
        </p>
      </div>
    </main>
  );
}
