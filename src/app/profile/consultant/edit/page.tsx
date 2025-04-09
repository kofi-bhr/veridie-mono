'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { supabase } from '@/lib/supabase/client';
import ConsultantProfileForm from '@/components/consultant/ConsultantProfileForm';

const ConsultantProfileEditPage = () => {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [consultantData, setConsultantData] = useState<any>(null);
  const [universities, setUniversities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        // Fetch consultant profile
        const { data: consultantData, error: consultantError } = await supabase
          .from('consultants')
          .select(`
            *,
            profiles:id(
              first_name,
              last_name,
              email
            )
          `)
          .eq('user_id', user.id)
          .single();

        if (consultantError) throw consultantError;
        
        // Fetch universities for dropdown
        const { data: universitiesData, error: universitiesError } = await supabase
          .from('universities')
          .select('*')
          .order('name');

        if (universitiesError) throw universitiesError;

        setConsultantData(consultantData);
        setUniversities(universitiesData || []);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/signin');
    }
  }, [user, isLoading, router]);

  if (isLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center min-h-screen">
        <div className="w-full max-w-4xl border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white p-8 rounded-md">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-main border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-lg">Loading profile data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center min-h-screen">
        <div className="w-full max-w-4xl border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white p-8 rounded-md">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Error</h1>
            <p className="text-red-500 mb-6">{error}</p>
            <button 
              onClick={() => router.push('/profile')}
              className="px-6 py-3 bg-main text-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-medium rounded-md"
            >
              Return to Profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-24 min-h-screen">
      <div className="w-full max-w-4xl mx-auto border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white p-6 md:p-8 rounded-md">
        <h1 className="text-3xl font-bold mb-2">Edit Mentor Profile</h1>
        <p className="text-gray-600 mb-8">Update your mentor profile information to attract more students.</p>
        
        <ConsultantProfileForm 
          initialData={consultantData} 
          universities={universities}
          userId={user?.id}
        />
      </div>
    </div>
  );
};

export default ConsultantProfileEditPage;
