'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import ProfileForm from '@/components/auth/ProfileForm';

type Profile = {
  id: string;
  first_name: string;
  last_name: string;
  is_verified: boolean;
  role: string;
};

const ProfilePage = () => {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setProfile(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    getProfile();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  if (loading) {
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

  if (!user) {
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
              onClick={() => setError(null)}
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center min-h-screen">
        <div className="w-full max-w-md border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white p-8 rounded-md">
          <ProfileForm />
        </div>
      </div>
    );
  }

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
              <p><span className="font-medium">Email:</span> {user.email}</p>
              <p><span className="font-medium">Name:</span> {profile.first_name} {profile.last_name}</p>
              <p><span className="font-medium">Role:</span> {profile.role}</p>
              <p><span className="font-medium">Verified:</span> {profile.is_verified ? 'Yes' : 'No'}</p>
            </div>

            <div className="flex flex-col space-y-4">
              <Button 
                variant="default" 
                className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                onClick={() => router.push('/profile/edit')}
              >
                Edit Profile
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
