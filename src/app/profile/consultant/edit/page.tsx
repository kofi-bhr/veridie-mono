'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { supabase } from '@/lib/supabase/client';
import ConsultantProfileForm from '@/components/consultant/ConsultantProfileForm';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

const ConsultantProfileEditPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [consultantData, setConsultantData] = useState<any>(null);
  const [universities, setUniversities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        // First check if user has a consultant profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role, id')
          .eq('id', user.id)
          .single();
          
        if (profileError) throw profileError;
        
        if (profileData.role !== 'consultant') {
          router.push('/profile');
          return;
        }
        
        // Fetch consultant profile
        const { data: consultantData, error: consultantError } = await supabase
          .from('consultants')
          .select(`
            *,
            awards (
              id, title, description, date, year
            ),
            extracurriculars (
              id, title, description, role, institution, years
            ),
            ap_scores (
              id, subject, score
            ),
            packages (
              id, title, description, price, features, billing_frequency, position, is_visible
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

  return (
    <ProtectedRoute requiredRole="consultant">
      <div className="container mx-auto px-4 py-24 min-h-screen">
        <div className="w-full max-w-4xl mx-auto border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white p-6 md:p-8 rounded-md">
          <h1 className="text-3xl font-bold mb-2">Edit Mentor Profile</h1>
          <p className="text-gray-600 mb-8">Update your mentor profile information to attract more students.</p>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="w-10 h-10 border-4 border-main border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-lg">Loading profile data...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500 mb-6">{error}</p>
              <button 
                onClick={() => router.push('/')}
                className="px-6 py-3 bg-main text-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-medium rounded-md"
              >
                Return to Home
              </button>
            </div>
          ) : (
            <ConsultantProfileForm 
              initialData={consultantData} 
              universities={universities}
              userId={user?.id || ""}
            />
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default ConsultantProfileEditPage;
