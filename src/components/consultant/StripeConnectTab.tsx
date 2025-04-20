import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { createOnboardingLink, verifyOnboardingStatus } from '@/app/profile/consultant/edit-direct/actions';

interface StripeConnectTabProps {
  consultantId: string;
  stripeAccountId: string | null;
  stripeChargesEnabled: boolean;
  stripeOnboardingComplete: boolean;
  onUpdate: () => void;
}

export function StripeConnectTab({
  consultantId,
  stripeAccountId,
  stripeChargesEnabled,
  stripeOnboardingComplete,
  onUpdate
}: StripeConnectTabProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<{
    charges_enabled?: boolean;
    payouts_enabled?: boolean;
    details_submitted?: boolean;
  }>({});

  useEffect(() => {
    // Check onboarding status when account ID exists but onboarding is not complete
    if (stripeAccountId && !stripeOnboardingComplete) {
      handleVerifyStatus();
    }
  }, [stripeAccountId, stripeOnboardingComplete]);

  const handleVerifyStatus = async () => {
    try {
      setIsVerifying(true);
      const result = await verifyOnboardingStatus(consultantId);
      if (result.success) {
        setVerificationStatus({
          charges_enabled: result.charges_enabled,
          payouts_enabled: result.payouts_enabled,
          details_submitted: result.details_submitted
        });
        onUpdate();
        toast.success('Onboarding Status Updated', {
          description: 'Your Stripe Connect account has been verified.'
        });
      } else {
        toast.error('Verification Failed', {
          description: 'Could not verify your Stripe Connect account status.'
        });
      }
    } catch (error) {
      toast.error('Verification Error', {
        description: 'An error occurred while verifying your account.'
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleStartOnboarding = async () => {
    try {
      setIsConnecting(true);
      const result = await createOnboardingLink(consultantId);
      if (result.success && result.url) {
        window.location.href = result.url;
      } else {
        toast.error('Connection Failed', {
          description: 'Could not start the Stripe Connect onboarding process.'
        });
      }
    } catch (error) {
      toast.error('Connection Error', {
        description: 'An error occurred while connecting to Stripe.'
      });
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Stripe Connect Status</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Account Connected</span>
            <span className={stripeAccountId ? 'text-green-600' : 'text-red-600'}>
              {stripeAccountId ? '✓' : '✗'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Details Submitted</span>
            <span className={verificationStatus.details_submitted ? 'text-green-600' : 'text-red-600'}>
              {verificationStatus.details_submitted ? '✓' : '✗'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Charges Enabled</span>
            <span className={verificationStatus.charges_enabled ? 'text-green-600' : 'text-red-600'}>
              {verificationStatus.charges_enabled ? '✓' : '✗'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Payouts Enabled</span>
            <span className={verificationStatus.payouts_enabled ? 'text-green-600' : 'text-red-600'}>
              {verificationStatus.payouts_enabled ? '✓' : '✗'}
            </span>
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        {!stripeAccountId ? (
          <Button
            onClick={handleStartOnboarding}
            className="w-full sm:w-auto"
            disabled={isConnecting}
          >
            {isConnecting ? 'Connecting...' : 'Connect with Stripe'}
          </Button>
        ) : !stripeOnboardingComplete ? (
          <Button
            onClick={handleVerifyStatus}
            className="w-full sm:w-auto"
            disabled={isVerifying}
          >
            {isVerifying ? 'Verifying...' : 'Verify Onboarding Status'}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
