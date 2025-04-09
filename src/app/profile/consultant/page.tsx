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
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [consultantData, setConsultantData] = useState<any>(null);
  const [universities, setUniversities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('basic-info');

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
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

        if (consultantError) throw consultantError;
        
        // Fetch universities for accepted schools
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
            <Button 
              onClick={() => router.push('/')}
              className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              Return to Home
            </Button>
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
            <p className="mb-6">You need to complete your mentor profile to start helping students.</p>
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

  // Get accepted universities
  const acceptedUniversities = universities.filter(
    (university) => consultantData.accepted_university_ids?.includes(university.id)
  );

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen">
      <div className="w-full max-w-4xl mx-auto">
        {/* Profile Header */}
        <Card className="mb-8 p-6 border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white rounded-md">
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-black flex-shrink-0">
              {consultantData.image_url ? (
                <Image
                  src={consultantData.image_url}
                  alt={`${consultantData.profiles?.first_name || 'Mentor'} profile`}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <User className="h-16 w-16 text-gray-400" />
                </div>
              )}
            </div>
            
            <div className="flex-grow text-center md:text-left">
              <h1 className="text-3xl font-bold">
                {consultantData.profiles?.first_name} {consultantData.profiles?.last_name}
              </h1>
              
              <p className="text-xl mt-2 text-gray-700">{consultantData.headline || 'Mentor'}</p>
              
              <div className="mt-4 flex flex-wrap gap-2 justify-center md:justify-start">
                {acceptedUniversities.map((university) => (
                  <span 
                    key={university.id}
                    className="px-3 py-1 bg-main/10 border border-main rounded-full text-sm"
                  >
                    {university.name}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="flex-shrink-0">
              <Link href="/profile/consultant/edit">
                <Button className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </Link>
            </div>
          </div>
        </Card>
        
        {/* Profile Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-2 md:grid-cols-4 mb-8 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <TabsTrigger value="basic-info" className="data-[state=active]:bg-main">
              <User className="h-4 w-4 mr-2" />
              <span className="hidden md:inline">Basic Info</span>
              <span className="md:hidden">Info</span>
            </TabsTrigger>
            <TabsTrigger value="education" className="data-[state=active]:bg-main">
              <GraduationCap className="h-4 w-4 mr-2" />
              <span className="hidden md:inline">Education</span>
              <span className="md:hidden">Edu</span>
            </TabsTrigger>
            <TabsTrigger value="achievements" className="data-[state=active]:bg-main">
              <Award className="h-4 w-4 mr-2" />
              <span className="hidden md:inline">Achievements</span>
              <span className="md:hidden">Awards</span>
            </TabsTrigger>
            <TabsTrigger value="services" className="data-[state=active]:bg-main">
              <Briefcase className="h-4 w-4 mr-2" />
              <span className="hidden md:inline">Services</span>
              <span className="md:hidden">Services</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic-info">
            <Card className="p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white rounded-md">
              <h2 className="text-xl font-bold mb-4">About Me</h2>
              <div className="whitespace-pre-wrap">{consultantData.bio || 'No bio provided.'}</div>
            </Card>
          </TabsContent>
          
          <TabsContent value="education">
            <Card className="p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white rounded-md">
              <h2 className="text-xl font-bold mb-4">Education</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold">University</h3>
                  <p>{consultantData.university || 'Not specified'}</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold">Major(s)</h3>
                  {consultantData.major && consultantData.major.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {consultantData.major.map((major: string, index: number) => (
                        <span 
                          key={index}
                          className="px-3 py-1 bg-gray-100 border border-gray-300 rounded-full text-sm"
                        >
                          {major}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p>Not specified</p>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold">GPA</h3>
                    {consultantData.gpa_score ? (
                      <p>
                        {consultantData.gpa_score}/{consultantData.gpa_scale || '4.0'} 
                        {consultantData.is_weighted ? ' (Weighted)' : ' (Unweighted)'}
                      </p>
                    ) : (
                      <p>Not specified</p>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold">Test Scores</h3>
                    <div className="space-y-2">
                      {consultantData.sat_reading || consultantData.sat_math ? (
                        <p>
                          SAT: {consultantData.sat_reading || 'N/A'} Reading, {consultantData.sat_math || 'N/A'} Math
                        </p>
                      ) : null}
                      
                      {consultantData.act_composite ? (
                        <p>ACT: {consultantData.act_composite}</p>
                      ) : null}
                      
                      {!consultantData.sat_reading && !consultantData.sat_math && !consultantData.act_composite && (
                        <p>Not specified</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="achievements">
            <Card className="p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white rounded-md">
              <h2 className="text-xl font-bold mb-4">Achievements & Activities</h2>
              
              <div className="space-y-8">
                {/* Awards */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Awards & Honors</h3>
                  
                  {consultantData.awards && consultantData.awards.length > 0 ? (
                    <div className="space-y-4">
                      {consultantData.awards.map((award: any) => (
                        <div key={award.id} className="p-4 border border-gray-200 rounded-md">
                          <div className="flex justify-between">
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
                          <div className="flex flex-col md:flex-row md:justify-between">
                            <div>
                              <h4 className="font-medium">{activity.title}</h4>
                              {activity.role && <p className="text-gray-700">{activity.role}</p>}
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
                  {consultantData.packages.map((pkg: any) => (
                    <Card 
                      key={pkg.id} 
                      className="p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white rounded-md flex flex-col h-full"
                    >
                      <div className="mb-4">
                        <h3 className="text-lg font-bold">{pkg.title}</h3>
                        <p className="text-2xl font-bold mt-2">${pkg.price}</p>
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
