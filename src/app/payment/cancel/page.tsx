'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { XCircle } from 'lucide-react';
import Link from 'next/link';

export default function CancelPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 text-center border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex flex-col items-center gap-4">
          <XCircle className="h-16 w-16 text-red-500" />
          <h1 className="text-2xl font-bold">Payment Cancelled</h1>
          <p className="text-foreground/80">
            Your payment was cancelled. No charges were made to your account.
          </p>
          <div className="flex gap-4 mt-4">
            <Button asChild>
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
} 