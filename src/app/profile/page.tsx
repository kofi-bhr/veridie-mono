'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { Button } from '@/components/ui/button';
import ProfileForm from '@/components/auth/ProfileForm';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

const ProfilePage = () => {
  const { user, profile, isLoading, isAuthenticated, isConsultant, signOut, refreshProfile } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Force refresh profile data when component mounts or after sign-in
  useEffect(() => {
    const loadProfile = async () => {
      console.log('ProfilePage: Loading profile data');
      
      if (!isAuthenticated) {
        console.log('ProfilePage: Not authenticated, skipping profile load');
        return;
      }
      
      if (!profile && retryCount < 3) {
        console.log(`ProfilePage: No profile data, refreshing (attempt ${retryCount + 1})`);
        try {
          await refreshProfile();
          setRetryCount(prev => prev + 1);
        } catch (err) {
          console.error('ProfilePage: Error refreshing profile:', err);
          setError('Failed to load profile data. Please try again.');
        }
      }
    };

    loadProfile();
    
    // Set up an interval to check and refresh profile data if needed
    const intervalId = setInterval(() => {
      if (isAuthenticated && !profile && retryCount < 3) {
        console.log('ProfilePage: Interval check - still no profile, refreshing');
        refreshProfile();
        setRetryCount(prev => prev + 1);
      }
    }, 2000); // Check every 2 seconds
    
    return () => clearInterval(intervalId);
  }, [isAuthenticated, profile, refreshProfile, retryCount]);

  const handleSignOut = async () => {
    try {
      console.log('ProfilePage: Signing out');
      await signOut();
      router.push('/');
    } catch (err) {
      console.error('ProfilePage: Error signing out:', err);
      setError('Failed to sign out. Please try again.');
    }
  };

  const handleRetry = () => {
    console.log('ProfilePage: Retrying profile load');
    setError(null);
    setRetryCount(0);
    refreshProfile();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center min-h-screen">
        <div className="w-full max-w-md border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white p-8 rounded-md">
          <div className="text-center">
            <p>Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('ProfilePage: Not authenticated, redirecting to signin');
    router.push('/auth/signin');
    return null;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center min-h-screen">
        <div className="w-full max-w-md border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white p-8 rounded-md">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Error</h1>
            <p className="text-red-500 mb-6">{error}</p>
            <Button 
              variant="default" 
              className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              onClick={handleRetry}
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // If we have a user but no profile, show the profile form
  if (!profile) {
    console.log('ProfilePage: User exists but no profile, showing profile form');
    return (
      <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center min-h-screen">
        <div className="w-full max-w-md border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white p-8 rounded-md">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold">Complete Your Profile</h1>
            <p className="mt-2 text-muted-foreground">
              Please provide your information to complete your profile
            </p>
          </div>
          <ProfileForm onSuccess={refreshProfile} />
        </div>
      </div>
    );
  }

  console.log('ProfilePage: Rendering profile for user:', user?.id);
  console.log('ProfilePage: Profile data:', profile);

  return (
    <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center min-h-screen">
      <div className="w-full max-w-md border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white p-8 rounded-md">
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold">Your Profile</h1>
            <p className="mt-2 text-muted-foreground">
              Manage your account information
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-4 border-2 border-black rounded-md">
              <h2 className="font-bold mb-2">Account Information</h2>
              <p><span className="font-medium">Email:</span> {user?.email || 'Not set'}</p>
              <p><span className="font-medium">Name:</span> {profile?.first_name || 'Not set'} {profile?.last_name || ''}</p>
              <p><span className="font-medium">Role:</span> {profile?.role || 'Not set'}</p>
              <p><span className="font-medium">Verified:</span> {profile?.is_verified ? 'Yes' : 'No'}</p>
            </div>

            <div className="flex flex-col space-y-4">
              {/* Only show Edit Profile button for consultants */}
              {isConsultant && (
                <Button 
                  variant="default" 
                  className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  onClick={() => router.push('/profile/consultant')}
                >
                  Edit Consultant Profile
                </Button>
              )}
              
              {/* Show appropriate dashboard link based on role */}
              <Button 
                variant="default" 
                className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                onClick={() => router.push(isConsultant ? '/dashboard/consultant' : '/dashboard/student')}
              >
                Go to Dashboard
              </Button>
              
              <Button 
                variant="reverse" 
                className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                onClick={handleSignOut}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
