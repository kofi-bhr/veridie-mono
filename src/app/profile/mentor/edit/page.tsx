'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { supabase } from '@/lib/supabase/client';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import MentorProfileForm from '@/components/consultant/MentorProfileForm';
import { AlertCircle } from 'lucide-react';

const EditMentorProfilePage = () => {
  const { user, isConsultant } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [consultantData, setConsultantData] = useState<any>(null);
  const [universities, setUniversities] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        // Fetch profile data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', user.id)
          .single();
          
        if (profileError) throw profileError;
        
        // Fetch consultant data
        const { data: consultantData, error: consultantError } = await supabase
          .from('consultants')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
          
        if (consultantError) throw consultantError;
        
        // Fetch AP scores
        let apScores = [];
        if (consultantData) {
          const { data: apData, error: apError } = await supabase
            .from('ap_scores')
            .select('*')
            .eq('consultant_id', consultantData.id);
            
          if (apError) throw apError;
          apScores = apData || [];
        }
        
        // Fetch extracurriculars
        let extracurriculars = [];
        if (consultantData) {
          const { data: extraData, error: extraError } = await supabase
            .from('extracurriculars')
            .select('*')
            .eq('consultant_id', consultantData.id);
            
          if (extraError) throw extraError;
          extracurriculars = extraData || [];
        }
        
        // Fetch awards
        let awards = [];
        if (consultantData) {
          const { data: awardsData, error: awardsError } = await supabase
            .from('awards')
            .select('*')
            .eq('consultant_id', consultantData.id);
            
          if (awardsError) throw awardsError;
          awards = awardsData || [];
        }
        
        // Fetch essays
        let essays = [];
        if (consultantData) {
          const { data: essaysData, error: essaysError } = await supabase
            .from('essays')
            .select('*')
            .eq('consultant_id', consultantData.id);
            
          if (essaysError) throw essaysError;
          essays = essaysData || [];
        }
        
        // Fetch universities
        const { data: universitiesData, error: universitiesError } = await supabase
          .from('universities')
          .select('*')
          .order('name');
          
        if (universitiesError) throw universitiesError;
        
        // Combine all data
        const combinedData = {
          ...profileData,
          ...consultantData,
          ap_scores: apScores,
          extracurriculars: extracurriculars,
          awards: awards,
          essays: essays
        };
        
        setConsultantData(combinedData);
        setUniversities(universitiesData || []);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err.message || 'An error occurred while fetching your profile data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user]);
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center min-h-screen">
        <div className="w-full max-w-4xl border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white p-8 rounded-md">
          <div className="text-center">
            <p>Loading profile data...</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (!user) {
    router.push('/auth/signin');
    return null;
  }
  
  if (!isConsultant) {
    return (
      <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center min-h-screen">
        <div className="w-full max-w-4xl border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white p-8 rounded-md">
          <div className="flex items-center gap-2 mb-4 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <p>You need to be a mentor to access this page.</p>
          </div>
          <p>Please go back to your profile and select the mentor role.</p>
        </div>
      </div>
    );
  }
  
  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center">
        <div className="w-full max-w-4xl border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white p-8 rounded-md">
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold">Edit Mentor Profile</h1>
              <p className="mt-2 text-muted-foreground">
                Update your mentor profile information
              </p>
            </div>
            
            {error && (
              <div className="p-4 mb-6 border-2 border-red-500 bg-red-50 rounded-md flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <p className="text-red-600">{error}</p>
              </div>
            )}
            
            <MentorProfileForm
              initialData={consultantData}
              universities={universities}
              userId={user.id}
            />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default EditMentorProfilePage;
