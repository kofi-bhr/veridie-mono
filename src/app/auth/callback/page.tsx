'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

const AuthCallbackPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const next = searchParams.get('next') || '/';
      const role = searchParams.get('role');

      if (code) {
        try {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          
          if (error) {
            throw error;
          }

          // Check if this is a new user
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.session?.user.id)
            .single();

          // If no profile exists, redirect to complete profile
          if (!profileData) {
            router.push(role ? `/auth/complete-profile?role=${role}` : '/auth/complete-profile');
          } else {
            router.push(next);
          }
        } catch (err: any) {
          console.error('Error during auth callback:', err);
          setError(err.message);
        }
      } else {
        router.push('/auth/signin');
      }
    };

    handleCallback();
  }, [router, searchParams]);

  if (error) {
    return (
      <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center min-h-screen">
        <div className="w-full max-w-md border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white p-8 rounded-md text-center">
          <h1 className="text-2xl font-bold mb-4">Authentication Error</h1>
          <p className="text-red-500 mb-6">{error}</p>
          <button 
            onClick={() => router.push('/auth/signin')}
            className="px-4 py-2 bg-main text-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-medium rounded-md"
          >
            Return to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center min-h-screen">
      <div className="w-full max-w-md border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white p-8 rounded-md text-center">
        <h1 className="text-2xl font-bold mb-4">Processing Authentication</h1>
        <p className="mb-6">Please wait while we complete your authentication...</p>
        <div className="w-8 h-8 border-4 border-main border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    </div>
  );
};

export default AuthCallbackPage;
