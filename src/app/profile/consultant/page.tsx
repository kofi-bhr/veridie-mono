'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Edit, Award, Briefcase, GraduationCap, User } from 'lucide-react';
import Image from 'next/image';

const ConsultantProfilePage = () => {
  const { user, profile, isLoading, isConsultant } = useAuth();
  const router = useRouter();
  const [consultantData, setConsultantData] = useState<any>(null);
  const [universities, setUniversities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('basic-info');

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        console.log('ConsultantProfilePage: No user, skipping data fetch');
        return;
      }

      try {
        console.log('ConsultantProfilePage: Fetching consultant data for user:', user.id);
        
        // Fetch consultant profile
        const { data: consultantData, error: consultantError } = await supabase
          .from('consultants')
          .select(`
            *,
            profiles:profiles(
              first_name,
              last_name,
              email
            ),
            awards(*),
            extracurriculars(*),
            ap_scores(*),
            packages(*)
          `)
          .eq('user_id', user.id)
          .single();

        if (consultantError) {
          console.error('ConsultantProfilePage: Error fetching consultant data:', consultantError.message || 'Unknown error');
          // Don't throw if it's just a "not found" error (PGRST116)
          if (consultantError.code === 'PGRST116') {
            console.log('ConsultantProfilePage: No consultant profile found, will show creation prompt');
            setConsultantData(null);
          } else {
            throw consultantError;
          }
        } else {
          console.log('ConsultantProfilePage: Successfully fetched consultant data');
          setConsultantData(consultantData);
        }
        
        // Fetch universities for accepted schools
        const { data: universitiesData, error: universitiesError } = await supabase
          .from('universities')
          .select('*')
          .order('name');

        if (universitiesError) {
          console.error('ConsultantProfilePage: Error fetching universities:', universitiesError.message || 'Unknown error');
          throw universitiesError;
        }

        setUniversities(universitiesData || []);
      } catch (err: any) {
        console.error('ConsultantProfilePage: Error fetching data:', err.message || 'Unknown error');
        setError(err.message || 'Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Redirect if not authenticated or not a consultant
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        console.log('ConsultantProfilePage: Not authenticated, redirecting to signin');
        router.push('/auth/signin');
      } else if (!isConsultant) {
        console.log('ConsultantProfilePage: User is not a consultant, redirecting to profile');
        router.push('/profile');
      }
    }
  }, [user, isLoading, router, isConsultant]);

  const handleRetry = () => {
    console.log('ConsultantProfilePage: Retrying data fetch');
    setError(null);
    setLoading(true);
    // Force re-fetch by changing the state
    setConsultantData(null);
    setUniversities([]);
  };

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
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={handleRetry}
                className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                Try Again
              </Button>
              <Button 
                onClick={() => router.push('/profile')}
                variant="reverse"
                className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                Return to Profile
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If consultant data doesn't exist, show a message to create profile
  if (!consultantData) {
    return (
      <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center min-h-screen">
        <div className="w-full max-w-4xl border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white p-8 rounded-md">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Complete Your Mentor Profile</h1>
            <p className="text-gray-600 mb-6">You haven&apos;t set up your mentor profile yet. Create one to start connecting with students.</p>
            <Link href="/profile/consultant/edit">
              <Button className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                Create Profile
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-24">
      <div className="w-full max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
          <div className="w-32 h-32 relative rounded-full overflow-hidden border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            {consultantData.image_url ? (
              <Image 
                src={consultantData.image_url} 
                alt={`${consultantData.profiles?.first_name || 'Mentor'} profile`}
                fill
                style={{ objectFit: 'cover' }}
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <User className="w-16 h-16 text-gray-400" />
              </div>
            )}
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold">
              {consultantData.profiles?.first_name} {consultantData.profiles?.last_name}
            </h1>
            <p className="text-xl text-gray-600 mt-1">{consultantData.headline}</p>
            <p className="mt-2">{consultantData.university} • {consultantData.major?.join(', ')}</p>
            
            <div className="mt-4">
              <Link href="/profile/consultant/edit">
                <Button className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2">
                  <Edit className="h-4 w-4" />
                  <span>Edit Profile</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <Tabs defaultValue="basic-info" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-3 mb-8 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <TabsTrigger value="basic-info" className="data-[state=active]:bg-main">
              <User className="h-4 w-4 mr-2 hidden md:inline" />
              About
            </TabsTrigger>
            <TabsTrigger value="education" className="data-[state=active]:bg-main">
              <GraduationCap className="h-4 w-4 mr-2 hidden md:inline" />
              Education
            </TabsTrigger>
            <TabsTrigger value="services" className="data-[state=active]:bg-main">
              <Briefcase className="h-4 w-4 mr-2 hidden md:inline" />
              Services
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic-info">
            <Card className="p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white rounded-md">
              <h2 className="text-xl font-bold mb-4">About Me</h2>
              <div className="whitespace-pre-wrap">{consultantData.bio}</div>
            </Card>
          </TabsContent>
          
          <TabsContent value="education">
            <Card className="p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white rounded-md">
              <div className="space-y-8">
                {/* Education */}
                <div>
                  <h2 className="text-xl font-bold mb-4">Education</h2>
                  <div className="p-4 border border-gray-200 rounded-md">
                    <h3 className="font-bold text-lg">{consultantData.university}</h3>
                    <p className="text-gray-600">{consultantData.major?.join(', ')}</p>
                    
                    {consultantData.gpa_score && (
                      <p className="mt-2">
                        <span className="font-medium">GPA:</span> {consultantData.gpa_score}/{consultantData.gpa_scale || 4.0} 
                        {consultantData.is_weighted && ' (weighted)'}
                      </p>
                    )}
                    
                    {(consultantData.sat_reading || consultantData.sat_math) && (
                      <p className="mt-1">
                        <span className="font-medium">SAT:</span> {consultantData.sat_reading || '—'} Reading, {consultantData.sat_math || '—'} Math
                      </p>
                    )}
                    
                    {consultantData.act_composite && (
                      <p className="mt-1">
                        <span className="font-medium">ACT:</span> {consultantData.act_composite}
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Awards */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Awards & Honors</h3>
                  
                  {consultantData.awards && consultantData.awards.length > 0 ? (
                    <div className="space-y-4">
                      {consultantData.awards.map((award: any) => (
                        <div key={award.id} className="p-4 border border-gray-200 rounded-md">
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium">{award.title}</h4>
                            {award.year && <span className="text-gray-500">{award.year}</span>}
                          </div>
                          {award.description && <p className="mt-2 text-gray-600">{award.description}</p>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No awards listed</p>
                  )}
                </div>
                
                {/* Extracurriculars */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Extracurricular Activities</h3>
                  
                  {consultantData.extracurriculars && consultantData.extracurriculars.length > 0 ? (
                    <div className="space-y-4">
                      {consultantData.extracurriculars.map((activity: any) => (
                        <div key={activity.id} className="p-4 border border-gray-200 rounded-md">
                          <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                            <div>
                              <h4 className="font-medium">{activity.title}</h4>
                              {activity.role && <p className="text-gray-600">{activity.role}</p>}
                              {activity.institution && <p className="text-gray-500">{activity.institution}</p>}
                            </div>
                            {activity.years && activity.years.length > 0 && (
                              <div className="mt-2 md:mt-0 text-gray-500">
                                {activity.years.sort().join(', ')}
                              </div>
                            )}
                          </div>
                          {activity.description && <p className="mt-2 text-gray-600">{activity.description}</p>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No activities listed</p>
                  )}
                </div>
                
                {/* AP Scores */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">AP Exam Scores</h3>
                  
                  {consultantData.ap_scores && consultantData.ap_scores.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {consultantData.ap_scores.map((ap: any) => (
                        <div key={ap.id} className="p-4 border border-gray-200 rounded-md">
                          <div className="flex justify-between items-center">
                            <span>{ap.subject}</span>
                            <span className="font-bold">{ap.score}/5</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No AP scores listed</p>
                  )}
                </div>
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="services">
            <Card className="p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white rounded-md">
              <h2 className="text-xl font-bold mb-4">Services & Packages</h2>
              
              {consultantData.packages && consultantData.packages.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {consultantData.packages
                    .filter((pkg: any) => pkg.is_visible !== false)
                    .sort((a: any, b: any) => (a.position || 0) - (b.position || 0))
                    .map((pkg: any) => (
                      <Card 
                        key={pkg.id} 
                        className="p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white rounded-md flex flex-col h-full"
                      >
                        <div className="mb-4">
                          <h3 className="text-lg font-bold">{pkg.title}</h3>
                          <p className="text-2xl font-bold mt-2">${pkg.price}</p>
                          {pkg.billing_frequency && pkg.billing_frequency !== 'one-time' && (
                            <p className="text-sm text-gray-500">
                              {pkg.billing_frequency === 'hourly' ? 'per hour' : 
                               pkg.billing_frequency === 'monthly' ? 'per month' :
                               pkg.billing_frequency === 'yearly' ? 'per year' : ''}
                            </p>
                          )}
                        </div>
                        
                        <p className="text-gray-600 mb-4 flex-grow">{pkg.description}</p>
                        
                        {pkg.features && pkg.features.length > 0 && (
                          <div className="mt-auto">
                            <h4 className="font-medium mb-2">What's included:</h4>
                            <ul className="space-y-2">
                              {pkg.features.map((feature: string, index: number) => (
                                <li key={index} className="flex items-start gap-2">
                                  <span className="text-main">✓</span>
                                  <span>{feature}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </Card>
                    ))}
                </div>
              ) : (
                <div className="text-center p-8">
                  <p className="text-gray-500 italic mb-4">No services or packages listed yet</p>
                  <Link href="/profile/consultant/edit?tab=services">
                    <Button className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                      Add Services
                    </Button>
                  </Link>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ConsultantProfilePage;
