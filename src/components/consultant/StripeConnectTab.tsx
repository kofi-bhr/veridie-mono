import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createOnboardingLink, verifyOnboarding, reconnectStripeAccount, getLoginLink } from '@/lib/stripe/onboarding';
import { useToast } from '@/components/ui/use-toast';
import { useUser } from '@/lib/auth/useUser';
import { Loader2, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface StripeStatus {
  charges_enabled?: boolean;
  payouts_enabled?: boolean;
  details_submitted?: boolean;
}

export function StripeConnectTab() {
  const { user, consultant } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [status, setStatus] = useState<StripeStatus>({});

  useEffect(() => {
    if (consultant?.id) {
      verifyStatus();
    }
  }, [consultant?.id]);

  const verifyStatus = async () => {
    if (!consultant?.id) return;
    setVerifying(true);
    const result = await verifyOnboarding(consultant.id);
    if (result.success) {
      setStatus({
        charges_enabled: result.charges_enabled,
        payouts_enabled: result.payouts_enabled,
        details_submitted: result.details_submitted,
      });
    }
    setVerifying(false);
  };

  const handleConnect = async () => {
    if (!consultant?.id) return;
    setLoading(true);
    const result = await createOnboardingLink(consultant.id);
    if (result.success && result.url) {
      window.location.href = result.url;
    } else {
      toast({
        title: 'Error',
        description: 'Failed to create Stripe Connect account. Please try again.',
        variant: 'destructive',
      });
    }
    setLoading(false);
  };

  const handleReconnect = async () => {
    if (!consultant?.id) return;
    setLoading(true);
    const result = await reconnectStripeAccount(consultant.id);
    if (result.success && result.url) {
      window.location.href = result.url;
    } else {
      toast({
        title: 'Error',
        description: 'Failed to reconnect Stripe account. Please try again.',
        variant: 'destructive',
      });
    }
    setLoading(false);
  };

  const handleManageAccount = async () => {
    if (!consultant?.id) return;
    setLoading(true);
    const result = await getLoginLink(consultant.id);
    if (result.success && result.url) {
      window.location.href = result.url;
    } else {
      toast({
        title: 'Error',
        description: 'Failed to access Stripe account. Please try again.',
        variant: 'destructive',
      });
    }
    setLoading(false);
  };

  if (!consultant) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          You must be a consultant to connect a Stripe account.
        </AlertDescription>
      </Alert>
    );
  }

  const isComplete = status.charges_enabled && status.payouts_enabled && status.details_submitted;
  const isPartiallyComplete = status.details_submitted && (!status.charges_enabled || !status.payouts_enabled);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Connect with Stripe</CardTitle>
        <CardDescription>
          Accept payments from clients by connecting your Stripe account.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {verifying ? (
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Verifying account status...</span>
          </div>
        ) : isComplete ? (
          <>
            <Alert variant="success" className="bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-600">Account Connected</AlertTitle>
              <AlertDescription>
                Your Stripe account is fully set up and ready to accept payments.
              </AlertDescription>
            </Alert>
            <Button onClick={handleManageAccount} disabled={loading}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Manage Stripe Account
            </Button>
          </>
        ) : isPartiallyComplete ? (
          <>
            <Alert variant="warning" className="bg-yellow-50">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertTitle className="text-yellow-600">Additional Information Required</AlertTitle>
              <AlertDescription>
                Your account is partially set up. Please complete all requirements to start accepting payments.
              </AlertDescription>
            </Alert>
            <div className="flex space-x-2">
              <Button onClick={handleManageAccount} disabled={loading}>
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Complete Setup
              </Button>
              <Button onClick={handleReconnect} variant="neutral" disabled={loading}>
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Start Over
              </Button>
            </div>
          </>
        ) : (
          <>
            {consultant.stripe_account_id && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Setup Incomplete</AlertTitle>
                <AlertDescription>
                  Your Stripe account setup is incomplete. Please complete the setup or start over.
                </AlertDescription>
              </Alert>
            )}
            <div className="flex space-x-2">
              <Button onClick={handleConnect} disabled={loading}>
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Connect with Stripe
              </Button>
              {consultant.stripe_account_id && (
                <Button onClick={handleReconnect} variant="neutral" disabled={loading}>
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Start Over
                </Button>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
