'use client';

import { useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { Button } from '@/components/ui/button';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'student' | 'consultant' | null; // Optional role requirement
}

const ProtectedRoute = ({ children, requiredRole = null }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [roleLoading, setRoleLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      // If not authenticated and done loading, redirect to sign in
      if (!isLoading && !user) {
        router.push('/auth/signin');
        return;
      }

      // If we need to check role and we have a user
      if (requiredRole && user) {
        try {
          const { createClient } = await import('@/lib/supabase/client');
          const supabase = createClient();
          
          const { data, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();
          
          if (error) throw error;
          
          setUserRole(data?.role || null);
          
          // If role doesn't match required role, show error
          if (data?.role !== requiredRole) {
            setError(`This page is only accessible to ${requiredRole}s.`);
          }
        } catch (err: any) {
          console.error('Error checking role:', err);
          setError('Error checking permissions. Please try again.');
        } finally {
          setRoleLoading(false);
        }
      } else {
        setRoleLoading(false);
      }
    };

    checkAuth();
  }, [user, isLoading, router, requiredRole]);

  // Show loading state
  if (isLoading || roleLoading) {
    return (
      <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center min-h-screen">
        <div className="w-full max-w-4xl border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white p-8 rounded-md">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-main border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-lg">Checking authentication...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error if role doesn't match
  if (error) {
    return (
      <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center min-h-screen">
        <div className="w-full max-w-4xl border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white p-8 rounded-md">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
            <p className="text-red-500 mb-6">{error}</p>
            <Button 
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-main text-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-medium rounded-md"
            >
              Return to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // If everything is fine, render children
  return <>{children}</>;
};

export default ProtectedRoute;
