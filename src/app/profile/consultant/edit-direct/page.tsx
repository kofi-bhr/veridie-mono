'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';

const ConsultantProfilePage = () => {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>({});

  // Simple data fetch
  useEffect(() => {
    const fetchData = async () => {
      if (authLoading) return;
      
      try {
        if (!user) {
          setLoading(false);
          setError("No user found. Please sign in.");
          return;
        }

        console.log("Fetching data for user:", user.id);
        
        // Get consultant data
        const { data: consultant, error: consultantError } = await supabase
          .from('consultants')
          .select('*')
          .eq('user_id', user.id)
          .single();
          
        if (consultantError) {
          console.error("Error fetching consultant:", consultantError);
          setError(`Error: ${consultantError.message}`);
          setLoading(false);
          return;
        }
        
        setData(consultant);
        setDebugInfo({
          userId: user.id,
          consultant
        });
        
      } catch (err) {
        console.error("Unexpected error:", err);
        setError("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, authLoading]);

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="p-4 border-2 border-red-500 rounded mb-4">
          <h2 className="font-bold mb-2">Error</h2>
          <p>{error}</p>
          <Button 
            onClick={() => window.location.reload()}
            className="mt-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-4">
        <div className="p-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="font-bold mb-2">No Profile Found</h2>
          <p>You need to create a consultant profile first.</p>
          <Button 
            onClick={() => router.push('/profile/consultant/create')}
            className="mt-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            Create Profile
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="p-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <h2 className="font-bold mb-4">Consultant Profile</h2>
        <pre className="bg-gray-100 p-2 rounded overflow-auto max-h-[500px] text-xs">
          {JSON.stringify(data, null, 2)}
        </pre>
        <Button 
          onClick={() => router.push('/profile/consultant/edit')}
          className="mt-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
        >
          Edit Profile
        </Button>
      </div>
      
      <div className="mt-4 p-4 border-2 border-gray-300 rounded">
        <h3 className="font-bold mb-2">Debug Info</h3>
        <pre className="bg-gray-100 p-2 rounded overflow-auto max-h-[300px] text-xs">
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default ConsultantProfilePage;
