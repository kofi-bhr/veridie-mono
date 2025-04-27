'use client';

import { useState } from 'react';
import { PackageWithConsultant } from '@/types/packages';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Calendar, Clock, DollarSign } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { toast } from 'sonner';

interface PackageDetailsProps {
  package: PackageWithConsultant;
  onPurchase?: () => void;
}

export function PackageDetails({ package: pkg, onPurchase }: PackageDetailsProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [isPurchasing, setIsPurchasing] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return 'No duration set';
    if (minutes < 60) return `${minutes} minutes`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h${remainingMinutes ? ` ${remainingMinutes}m` : ''}`;
  };

  const handlePurchase = async () => {
    try {
      if (!user) {
        // Save intended purchase to session storage
        sessionStorage.setItem('intended_purchase', pkg.id);
        router.push('/login');
        return;
      }

      setIsPurchasing(true);

      // Create Stripe Checkout session
      const response = await fetch('/api/checkout/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          packageId: pkg.id,
          consultantId: pkg.consultant_id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      router.push(data.url);
    } catch (error) {
      console.error('Error initiating purchase:', error);
      toast.error('Failed to initiate purchase. Please try again.');
    } finally {
      setIsPurchasing(false);
    }
  };

  const consultantName = pkg.consultant?.user
    ? `${pkg.consultant.user.first_name || ''} ${
        pkg.consultant.user.last_name || ''
      }`.trim()
    : 'Consultant';

  return (
    <Card className="p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{pkg.title}</h1>
          <p className="text-gray-600 mt-2">{pkg.description}</p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            <span className="text-2xl font-bold">{formatPrice(pkg.price)}</span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            <span>{formatDuration(pkg.duration)}</span>
          </div>

          {pkg.calendly_link && (
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              <span>Includes scheduling via Calendly</span>
            </div>
          )}
        </div>

        <div className="border-t-2 border-black pt-4">
          <h2 className="text-lg font-semibold mb-2">About {consultantName}</h2>
          {pkg.consultant?.contact_email && (
            <p className="text-sm text-gray-600">
              You&apos;ll receive contact information after purchase
            </p>
          )}
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handlePurchase}
            disabled={isPurchasing || !pkg.is_active}
            className="w-full md:w-auto border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            {isPurchasing
              ? 'Processing...'
              : !pkg.is_active
              ? 'Currently Unavailable'
              : `Purchase for ${formatPrice(pkg.price)}`}
          </Button>
        </div>
      </div>
    </Card>
  );
}
