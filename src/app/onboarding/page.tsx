'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { supabase } from '@/lib/supabase/client';
import RoleSelectionForm from '@/components/auth/RoleSelectionForm';

const OnboardingPage = () => {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [checkingRole, setCheckingRole] = useState(true);

  useEffect(() => {
    // If not logged in, redirect to sign in
    if (!isLoading && !user) {
      router.push('/auth/signin');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    const checkUserRole = async () => {
      if (!user) return;

      try {
        // Check if user already has a role
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        // If user already has a role, redirect accordingly
        if (data && data.role) {
          if (data.role === 'consultant') {
            router.push('/profile/consultant');
          } else {
            router.push('/');
          }
        }
      } catch (err) {
        console.error('Error checking user role:', err);
      } finally {
        setCheckingRole(false);
      }
    };

    checkUserRole();
  }, [user, router]);

  if (isLoading || checkingRole) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <RoleSelectionForm />
    </div>
  );
};

export default OnboardingPage;
