'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { Button } from '@/components/ui/button';

type ProtectedRouteProps = {
  children: React.ReactNode;
  requiredRole?: 'student' | 'consultant';
};

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, profile, isLoading, isAuthenticated, isConsultant, isStudent } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Skip authorization check if still loading
    if (isLoading) return;

    // If not authenticated, redirect to sign in
    if (!isAuthenticated) {
      router.push('/auth/signin');
      return;
    }

    // If no specific role is required, user is authorized
    if (!requiredRole) {
      setIsAuthorized(true);
      return;
    }

    // Check if user has the required role
    if (requiredRole === 'consultant' && !isConsultant) {
      setError('This page is only accessible to consultants.');
      return;
    }

    if (requiredRole === 'student' && !isStudent) {
      setError('This page is only accessible to students.');
      return;
    }

    // User has the required role
    setIsAuthorized(true);
  }, [user, profile, isLoading, isAuthenticated, isConsultant, isStudent, router, requiredRole]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center min-h-screen">
        <div className="w-full max-w-md border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white p-8 rounded-md">
          <div className="text-center">
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center min-h-screen">
        <div className="w-full max-w-md border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white p-8 rounded-md">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
            <p className="text-red-500 mb-6">{error}</p>
            <Button 
              variant="default" 
              className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              onClick={() => router.push('/profile')}
            >
              Go to Profile
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // If authorized, render children
  return isAuthorized ? <>{children}</> : null;
};

export default ProtectedRoute;
