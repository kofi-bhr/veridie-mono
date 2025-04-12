'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Upload, X, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import Image from 'next/image';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// This is a special page that bypasses middleware authentication
// It handles authentication directly on the client side
export default function ConsultantEditDirectPage() {
  const router = useRouter();
  const { user, profile, isAuthenticated, isConsultant, isLoading } = useAuth();
  const [consultantProfile, setConsultantProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("basic-info");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [satEnabled, setSatEnabled] = useState(true);
  const [actEnabled, setActEnabled] = useState(false);
  const [newInterest, setNewInterest] = useState('');
  const [universities, setUniversities] = useState<any[]>([]);
  
  // AP Scores state
  const [apScores, setApScores] = useState<Array<{subject: string, score: number, id?: string}>>([]);
  const [selectedApCourse, setSelectedApCourse] = useState('');
  const [selectedApScore, setSelectedApScore] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    headline: '',
    university: '',
    interests: [] as string[],
    sat_score: 1200,
    act_composite: 24,
    accepted_university_ids: [] as string[],
    image_url: '',
  });

  // Fetch universities list
  const fetchUniversities = async () => {
    try {
      const { data, error } = await supabase
        .from('universities')
        .select('*')
        .order('name');
        
      if (error) throw error;
      setUniversities(data || []);
    } catch (error) {
      console.error('Error fetching universities:', error);
    }
  };

  // List of AP courses
  const AP_COURSES = [
    "Art History",
    "Biology",
    "Calculus AB",
    "Calculus BC",
    "Chemistry",
    "Chinese Language and Culture",
    "Computer Science A",
    "Computer Science Principles",
    "English Language",
    "English Literature",
    "Environmental Science",
    "European History",
    "French Language and Culture",
    "German Language and Culture",
    "Government and Politics (Comparative)",
    "Government and Politics (US)",
    "Human Geography",
    "Italian Language and Culture",
    "Japanese Language and Culture",
    "Latin",
    "Macroeconomics",
    "Microeconomics",
    "Music Theory",
    "Physics 1",
    "Physics 2",
    "Physics C: Electricity and Magnetism",
    "Physics C: Mechanics",
    "Psychology",
    "Research",
    "Seminar",
    "Spanish Language and Culture",
    "Spanish Literature and Culture",
    "Statistics",
    "Studio Art: 2-D Design",
    "Studio Art: 3-D Design",
    "Studio Art: Drawing",
    "US History",
    "World History"
  ];

  // Filter out courses that have already been selected
  const availableApCourses = AP_COURSES.filter(course => {
    return !apScores.some(score => score.subject === course);
  });

  // Check authentication on the client side
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Wait for auth to initialize
        if (isLoading) return;

        console.log('Auth state:', { isAuthenticated, isConsultant, user });

        // If not authenticated or not a consultant, redirect to login
        if (!isAuthenticated) {
          console.log('Not authenticated, redirecting to login');
          toast.error('You must be signed in to access this page');
          router.push('/auth/signin?redirect=/profile/consultant/edit-direct');
          return;
        }

        // Fetch the consultant profile
        await fetchConsultantProfile();
      } catch (error) {
        console.error('Error checking authentication:', error);
        toast.error('Authentication error. Please try again.');
        setLoading(false); // Ensure loading is set to false even on error
      }
    };

    checkAuth();
  }, [isLoading, isAuthenticated, isConsultant, user]);

  // Fetch universities on component mount
  useEffect(() => {
    if (!loading && user) {
      fetchUniversities();
    }
  }, [loading, user]);

  // Fetch the consultant profile
  const fetchConsultantProfile = async () => {
    try {
      if (!user) {
        console.log('No user found, cannot fetch profile');
        setLoading(false);
        return;
      }

      console.log('Fetching consultant profile for user:', user.id);
      
      // First, check if the user has a consultant profile
      const { data: consultant, error: consultantError } = await supabase
        .from('consultants')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (consultantError && consultantError.code !== 'PGRST116') {
        console.error('Error fetching consultant profile:', consultantError);
        toast.error('Failed to load profile data');
        setLoading(false);
        return;
      }
      
      if (!consultant) {
        console.log('No consultant profile found, creating default');
        await createDefaultProfile();
        return;
      }
      
      console.log('Consultant profile found:', consultant);
      setConsultantProfile(consultant);
      
      // Load form data from the profile
      setFormData({
        first_name: profile?.first_name || '',
        last_name: profile?.last_name || '',
        headline: consultant.headline || '',
        university: consultant.university_id || '',
        interests: consultant.interests || [],
        sat_score: consultant.sat_score || 1200,
        act_composite: consultant.act_composite || 24,
        accepted_university_ids: consultant.accepted_university_ids || [],
        image_url: profile ? (profile as any).avatar_url || '' : '',
      });
      
      // Load AP scores
      if (consultant.ap_scores && consultant.ap_scores.length > 0) {
        setApScores(consultant.ap_scores);
      }
      
      // Set test score toggles
      setSatEnabled(consultant.sat_score !== null);
      setActEnabled(consultant.act_composite !== null);
      
      setLoading(false);
    } catch (error) {
      console.error('Error in fetchConsultantProfile:', error);
      toast.error('Failed to load profile data');
      setLoading(false);
    }
  };

  // Create a default profile if none exists
  const createDefaultProfile = async () => {
    try {
      if (!user?.id) {
        console.error('No user ID available');
        toast.error('User information is missing');
        return;
      }

      // Create a unique slug
      const slug = `mentor-${user.id.substring(0, 8)}-${Math.random().toString(36).substring(2, 7)}`;
      
      // Create a default consultant profile
      const defaultProfile = {
        user_id: user.id,
        first_name: 'First Name',
        last_name: 'Last Name',
        headline: 'Coming Soon',
        image_url: 'https://placehold.co/300x300',
        slug: slug,
        university: 'Not specified',
        interests: ['Undecided'],
        sat_score: 1200,
        act_composite: 24,
        accepted_university_ids: [],
      };
      
      console.log('Creating default profile:', defaultProfile);
      const { data, error } = await supabase
        .from('consultants')
        .insert(defaultProfile)
        .select()
        .single();
      
      if (error) {
        console.error('Error creating default profile:', error);
        toast.error('Failed to create your profile');
        return;
      }
      
      console.log('Default profile created:', data);
      setConsultantProfile(data);
      setFormData({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        headline: data.headline || '',
        university: data.university || '',
        interests: data.interests || [],
        sat_score: data.sat_score || 1200,
        act_composite: data.act_composite || 24,
        accepted_university_ids: data.accepted_university_ids || [],
        image_url: data.image_url || 'https://placehold.co/300x300',
      });
      
      toast.success('Default profile created. You can now customize it.');
    } catch (error) {
      console.error('Error in createDefaultProfile:', error);
      toast.error('Failed to create your profile');
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'sat_score' || name === 'act_composite' ? parseInt(value) || 0 : value,
    }));
  };

  // Handle major checkbox changes
  const handleMajorChange = (major: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      interests: checked
        ? [...prev.interests, major]
        : prev.interests.filter(m => m !== major),
    }));
  };

  // Handle file upload for profile image
  const handleFileUpload = async (file: File) => {
    if (!file || !user) return null;
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `profile-images/${fileName}`;
      
      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);
        
      // Update form data with new image URL
      setFormData(prev => ({
        ...prev,
        image_url: data.publicUrl
      }));
      
      return data.publicUrl;
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload image');
      return null;
    }
  };

  // Handle adding a new interest
  const handleAddInterest = () => {
    if (!newInterest.trim()) return;
    
    if (!formData.interests.includes(newInterest)) {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, newInterest]
      }));
      setNewInterest('');
    }
  };

  // Handle removing an interest
  const handleRemoveInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest)
    }));
  };

  // Handle adding an AP score
  const handleAddAPScore = () => {
    if (!selectedApCourse || selectedApScore === null) return;
    
    // Check if this course already exists
    const courseExists = apScores.some(score => score.subject === selectedApCourse);
    
    if (!courseExists) {
      setApScores([
        ...apScores, 
        { subject: selectedApCourse, score: selectedApScore }
      ]);
      
      // Reset selections
      setSelectedApCourse('');
      setSelectedApScore(null);
    }
  };

  // Handle removing an AP score
  const handleRemoveAPScore = (index: number) => {
    setApScores(apScores.filter((_, i) => i !== index));
  };

  // Save the profile
  const handleSave = async () => {
    try {
      setSaving(true);
      
      if (!user?.id) {
        toast.error('User information is missing');
        return;
      }
      
      if (!consultantProfile?.id) {
        toast.error('Consultant profile not found');
        return;
      }
      
      console.log('Saving profile:', formData);
      
      // Update profile with first and last name
      await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          first_name: formData.first_name,
          last_name: formData.last_name,
        });
      
      // Update consultant profile
      const { error } = await supabase
        .from('consultants')
        .update({
          headline: formData.headline,
          university: formData.university,
          image_url: formData.image_url,
          sat_score: formData.sat_score,
          act_composite: formData.act_composite,
          interests: formData.interests,
          accepted_university_ids: formData.accepted_university_ids,
          num_aps: apScores.length
        })
        .eq('id', consultantProfile.id);
        
      if (error) throw error;
      
      // Handle AP Scores
      if (apScores.length > 0) {
        // Get existing AP scores to determine which to update/delete
        const { data: existingScores } = await supabase
          .from('ap_scores')
          .select('id, subject')
          .eq('consultant_id', consultantProfile.id);
          
        const existingScoreIds = existingScores?.map(score => score.id) || [];
        const newScoreIds = apScores.filter(score => score.id).map(score => score.id as string);
        
        // Delete scores that are no longer present
        if (existingScoreIds.length > 0) {
          const scoreIdsToDelete = existingScoreIds.filter(id => !newScoreIds.includes(id));
          if (scoreIdsToDelete.length > 0) {
            await supabase
              .from('ap_scores')
              .delete()
              .in('id', scoreIdsToDelete);
          }
        }
        
        // Update or insert scores
        for (const score of apScores) {
          if (score.id) {
            // Update existing score
            await supabase
              .from('ap_scores')
              .update({
                subject: score.subject,
                score: score.score
              })
              .eq('id', score.id);
          } else {
            // Insert new score
            await supabase
              .from('ap_scores')
              .insert({
                consultant_id: consultantProfile.id,
                subject: score.subject,
                score: score.score
              });
          }
        }
      }
      
      toast.success('Profile saved successfully');
      
      // Refresh the profile data
      await fetchConsultantProfile();
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast.error(`Failed to save profile: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Available majors
  const availableMajors = [
    'Computer Science',
    'Engineering',
    'Business',
    'Mathematics',
    'Biology',
    'Chemistry',
    'Physics',
    'Economics',
    'Psychology',
    'English',
    'History',
    'Political Science',
    'Undecided',
  ];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center min-h-screen">
        <div className="w-full max-w-4xl border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white p-8 rounded-md">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading profile data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-20 flex flex-col items-center justify-center">
      <div className="w-full max-w-4xl border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white p-8 rounded-md">
        <h1 className="text-3xl font-bold mb-6 text-center">Edit Your Mentor Profile</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-3 mb-8 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <TabsTrigger value="basic-info" className="data-[state=active]:bg-main">Basic Info</TabsTrigger>
            <TabsTrigger value="education" className="data-[state=active]:bg-main">Education</TabsTrigger>
            <TabsTrigger value="achievements" className="data-[state=active]:bg-main">Achievements</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic-info" className="space-y-6">
            {/* Profile Image Upload */}
            <div className="flex flex-col items-center mb-8">
              <div 
                className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer mb-4"
                onClick={() => fileInputRef.current?.click()}
              >
                {formData.image_url ? (
                  <Image
                    src={formData.image_url}
                    alt="Profile preview"
                    fill
                    className="object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://placehold.co/300x300';
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <Upload className="h-8 w-8 text-gray-500" />
                  </div>
                )}
              </div>
              <Button 
                type="button" 
                variant="default" 
                size="sm"
                className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                onClick={() => fileInputRef.current?.click()}
              >
                Upload Profile Image
              </Button>
              <p className="text-sm text-gray-500 mt-2">
                Upload a professional profile photo
              </p>
              
              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    await handleFileUpload(file);
                  }
                }}
              />
            </div>
            
            {/* First Name and Last Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="first_name" className="text-base font-medium mb-2 block">
                  First Name
                </Label>
                <Input
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  placeholder="Your first name"
                  className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 text-base"
                />
              </div>
              
              <div>
                <Label htmlFor="last_name" className="text-base font-medium mb-2 block">
                  Last Name
                </Label>
                <Input
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  placeholder="Your last name"
                  className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 text-base"
                />
              </div>
            </div>
            
            {/* Headline */}
            <div>
              <Label htmlFor="headline" className="text-base font-medium mb-2 block">
                Headline
              </Label>
              <Input
                id="headline"
                name="headline"
                value={formData.headline}
                onChange={handleInputChange}
                placeholder="e.g., Harvard Student helping with college applications"
                className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 text-base"
              />
              <p className="text-sm text-gray-500 mt-1">
                A short headline that appears at the top of your profile
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="education" className="space-y-6">
            {/* University */}
            <div>
              <Label htmlFor="university" className="text-base font-medium mb-2 block">
                Attending University
              </Label>
              <Select
                value={formData.university}
                onValueChange={(value) => {
                  setFormData(prev => ({
                    ...prev,
                    university: value
                  }));
                  
                  // Find the university object
                  const uni = universities.find(u => u.name === value);
                  if (uni) {
                    // Add to accepted universities if not already there
                    if (!formData.accepted_university_ids.includes(uni.id)) {
                      setFormData(prev => ({
                        ...prev,
                        accepted_university_ids: [...prev.accepted_university_ids, uni.id]
                      }));
                    }
                  }
                }}
              >
                <SelectTrigger className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 text-base">
                  <SelectValue placeholder="Select your university" />
                </SelectTrigger>
                <SelectContent>
                  {universities.map((university) => (
                    <SelectItem key={university.id} value={university.name}>
                      {university.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500 mt-1">
                Your current university
              </p>
            </div>
            
            {/* Accepted Universities */}
            <div>
              <Label className="text-base font-medium mb-2 block">
                Accepted Universities
              </Label>
              <p className="text-sm text-gray-500 mb-2">
                Select all universities that accepted you
              </p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {formData.accepted_university_ids.map((id) => {
                  const uni = universities.find(u => u.id === id);
                  if (!uni) return null;
                  
                  return (
                    <div 
                      key={id}
                      className="flex items-center gap-2 bg-main/10 px-3 py-1 rounded-full"
                    >
                      <span>{uni.name}</span>
                      <button
                        type="button"
                        onClick={() => {
                          // Don't allow removing the current university
                          if (uni.name === formData.university) return;
                          
                          setFormData(prev => ({
                            ...prev,
                            accepted_university_ids: prev.accepted_university_ids.filter(uniId => uniId !== id)
                          }));
                        }}
                        className="text-black/70 hover:text-black"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {universities.map((university) => {
                  // Skip if already in the list
                  if (formData.accepted_university_ids.includes(university.id)) return null;
                  
                  return (
                    <div key={university.id} className="flex items-start space-x-2">
                      <Checkbox
                        id={university.id}
                        checked={formData.accepted_university_ids.includes(university.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData(prev => ({
                              ...prev,
                              accepted_university_ids: [...prev.accepted_university_ids, university.id]
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              accepted_university_ids: prev.accepted_university_ids.filter(id => id !== university.id)
                            }));
                          }
                        }}
                        className="border-2 border-black data-[state=checked]:bg-main"
                      />
                      <label
                        htmlFor={university.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {university.name}
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Interests */}
            <div className="space-y-4">
              <Label className="text-base font-medium mb-2 block">
                Interests
              </Label>
              <p className="text-sm text-gray-500">
                What were you into in high school? Include anything related to your current major or application spike.
              </p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {formData.interests.map((interest, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-2 bg-main/10 px-3 py-1 rounded-full"
                  >
                    <span>{interest}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveInterest(interest)}
                      className="text-black/70 hover:text-black"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-2">
                <Input
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  placeholder="Add an interest"
                  className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 text-base"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddInterest();
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={handleAddInterest}
                  variant="default"
                  className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
            </div>
            
            {/* SAT Score Slider */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">SAT Score</Label>
                <Checkbox 
                  checked={satEnabled}
                  onCheckedChange={(checked) => {
                    setSatEnabled(!!checked);
                    if (!checked) {
                      setFormData(prev => ({
                        ...prev,
                        sat_score: 0
                      }));
                    } else {
                      setFormData(prev => ({
                        ...prev,
                        sat_score: 1200
                      }));
                    }
                  }}
                  className="border-2 border-black data-[state=checked]:bg-main"
                />
              </div>
              
              <div className={`space-y-4 ${!satEnabled ? 'opacity-50' : ''}`}>
                <Slider
                  disabled={!satEnabled}
                  min={400}
                  max={1600}
                  step={10}
                  value={[formData.sat_score]}
                  onValueChange={(values) => {
                    setFormData(prev => ({
                      ...prev,
                      sat_score: values[0]
                    }));
                  }}
                  className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6"
                />
                <div className="flex justify-between">
                  <span>400</span>
                  <span className="font-bold">{formData.sat_score}</span>
                  <span>1600</span>
                </div>
              </div>
            </div>
            
            {/* ACT Score Slider */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">ACT Composite Score</Label>
                <Checkbox 
                  checked={actEnabled}
                  onCheckedChange={(checked) => {
                    setActEnabled(!!checked);
                    if (!checked) {
                      setFormData(prev => ({
                        ...prev,
                        act_composite: 0
                      }));
                    } else {
                      setFormData(prev => ({
                        ...prev,
                        act_composite: 24
                      }));
                    }
                  }}
                  className="border-2 border-black data-[state=checked]:bg-main"
                />
              </div>
              
              <div className={`space-y-4 ${!actEnabled ? 'opacity-50' : ''}`}>
                <Slider
                  disabled={!actEnabled}
                  min={1}
                  max={36}
                  step={1}
                  value={[formData.act_composite]}
                  onValueChange={(values) => {
                    setFormData(prev => ({
                      ...prev,
                      act_composite: values[0]
                    }));
                  }}
                  className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6"
                />
                <div className="flex justify-between">
                  <span>1</span>
                  <span className="font-bold">{formData.act_composite}</span>
                  <span>36</span>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="achievements" className="space-y-8">
            {/* AP Scores */}
            <Collapsible className="w-full border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 rounded-md">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">AP Scores</h3>
                <CollapsibleTrigger asChild>
                  <Button variant="reverse" size="sm" className="p-2">
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </CollapsibleTrigger>
              </div>
              
              <CollapsibleContent className="mt-4 space-y-4">
                <p className="text-sm text-gray-500">
                  Add your AP courses and scores. These will be displayed on your profile.
                </p>
                
                {/* Display current AP scores */}
                {apScores.length > 0 && (
                  <div className="space-y-2 mb-4">
                    <div className="grid grid-cols-3 gap-2 font-semibold text-sm">
                      <div>AP Course</div>
                      <div>Score</div>
                      <div></div>
                    </div>
                    {apScores.map((score, index) => (
                      <div key={index} className="grid grid-cols-3 gap-2 items-center">
                        <div>{score.subject}</div>
                        <div>{score.score}</div>
                        <div>
                          <Button
                            type="button"
                            variant="reverse"
                            size="sm"
                            className="p-1"
                            onClick={() => handleRemoveAPScore(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Add new AP score */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm">AP Course</Label>
                    <Select
                      value={selectedApCourse}
                      onValueChange={setSelectedApCourse}
                    >
                      <SelectTrigger className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 text-sm">
                        <SelectValue placeholder="Select course" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableApCourses.map((course) => (
                          <SelectItem key={course} value={course}>
                            {course}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-sm">Score</Label>
                    <Select
                      value={selectedApScore?.toString() || ''}
                      onValueChange={(value) => setSelectedApScore(parseInt(value))}
                    >
                      <SelectTrigger className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 text-sm">
                        <SelectValue placeholder="Select score" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5].map((score) => (
                          <SelectItem key={score} value={score.toString()}>
                            {score}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-end">
                    <Button
                      type="button"
                      onClick={handleAddAPScore}
                      variant="default"
                      disabled={!selectedApCourse || selectedApScore === null}
                      className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add AP Score
                    </Button>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </TabsContent>
        </Tabs>
        
        {/* Save Button */}
        <div className="flex justify-end mt-8">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="px-8 py-3 text-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-main hover:bg-main/90 text-white"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Profile'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
