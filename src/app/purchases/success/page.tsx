'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { PurchaseWithDetails } from '@/types/packages';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Calendar, Mail, Phone, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { trackContactInitiated, trackCalendlyScheduled } from '@/app/api/purchases/actions';

export default function PurchaseSuccessPage() {
  const searchParams = useSearchParams();
  const [purchase, setPurchase] = useState<PurchaseWithDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const purchaseId = searchParams.get('purchase_id');
    if (!purchaseId) return;

    const fetchPurchaseDetails = async () => {
      try {
        const { data, error } = await supabase
          .from('purchases')
          .select(`
            *,
            package:packages (
              *,
              consultant:consultants (
                contact_email,
                contact_phone,
                welcome_template,
                user:profiles (
                  first_name,
                  last_name
                )
              )
            )
          `)
          .eq('id', purchaseId)
          .single();

        if (error) throw error;
        setPurchase(data as PurchaseWithDetails);
      } catch (error) {
        console.error('Error fetching purchase details:', error);
        toast.error('Failed to load purchase details');
      } finally {
        setLoading(false);
      }
    };

    fetchPurchaseDetails();
  }, [searchParams]);

  const handleContactClick = async () => {
    if (!purchase) return;

    try {
      const result = await trackContactInitiated(purchase.id);
      if (!result.success) {
        throw new Error(result.error);
      }

      // Update local state
      setPurchase((prev) => 
        prev ? { ...prev, contact_initiated: true } : null
      );
    } catch (error) {
      console.error('Error tracking contact:', error);
      toast.error('Failed to update contact status');
    }
  };

  const handleCalendlyClick = async () => {
    if (!purchase) return;

    try {
      const result = await trackCalendlyScheduled(purchase.id);
      if (!result.success) {
        throw new Error(result.error);
      }

      // Update local state
      setPurchase((prev) => 
        prev ? { ...prev, calendly_scheduled: true } : null
      );
    } catch (error) {
      console.error('Error tracking scheduling:', error);
      toast.error('Failed to update scheduling status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="space-y-4">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-24 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!purchase) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-2xl mx-auto">
          <Card className="p-8 text-center border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <h1 className="text-2xl font-bold mb-4">Purchase Not Found</h1>
            <p className="text-gray-600">
              We couldn&apos;t find the purchase details. Please check your purchases page
              or contact support if you believe this is an error.
            </p>
          </Card>
        </div>
      </div>
    );
  }

  const consultantName = purchase.package.consultant?.user
    ? `${purchase.package.consultant.user.first_name || ''} ${
        purchase.package.consultant.user.last_name || ''
      }`.trim()
    : 'your consultant';

  const welcomeTemplate = purchase.package.consultant?.welcome_template
    ?.replace('{{consultant_name}}', consultantName) || '';

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="p-8 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center gap-4 mb-6">
            <CheckCircle2 className="h-8 w-8 text-green-500" />
            <h1 className="text-2xl font-bold">Purchase Successful!</h1>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">{purchase.package.title}</h2>
              <p className="text-gray-600">{purchase.package.description}</p>
            </div>

            <div className="border-t-2 border-black pt-4">
              <h3 className="text-lg font-semibold mb-4">Next Steps</h3>

              <div className="space-y-4">
                {purchase.package.consultant?.contact_email && (
                  <div>
                    <Button
                      variant="neutral"
                      className="w-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mb-2"
                      onClick={handleContactClick}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      {purchase.contact_initiated
                        ? 'Contact Information'
                        : 'View Contact Information'}
                    </Button>
                    {purchase.contact_initiated && (
                      <div className="p-4 bg-gray-50 rounded-md space-y-2">
                        {purchase.package.consultant.contact_email && (
                          <p className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            <a
                              href={`mailto:${purchase.package.consultant.contact_email}`}
                              className="text-blue-500 hover:underline"
                            >
                              {purchase.package.consultant.contact_email}
                            </a>
                          </p>
                        )}
                        {purchase.package.consultant.contact_phone && (
                          <p className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            <a
                              href={`tel:${purchase.package.consultant.contact_phone}`}
                              className="text-blue-500 hover:underline"
                            >
                              {purchase.package.consultant.contact_phone}
                            </a>
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {purchase.package.calendly_link && (
                  <div>
                    <Button
                      variant="neutral"
                      className="w-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mb-2"
                      onClick={() => {
                        handleCalendlyClick();
                        window.open(purchase.package.calendly_link, '_blank');
                      }}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule Your Session
                    </Button>
                    {purchase.calendly_scheduled && (
                      <p className="text-sm text-gray-500">
                        You&apos;ve opened the scheduling page
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {welcomeTemplate && (
              <div className="border-t-2 border-black pt-4">
                <h3 className="text-lg font-semibold mb-2">Welcome Message</h3>
                <div className="whitespace-pre-wrap text-gray-600">
                  {welcomeTemplate}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
