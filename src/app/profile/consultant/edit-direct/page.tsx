'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';

// This is a special page that bypasses middleware authentication
// It handles authentication directly on the client side
export default function ConsultantEditDirectPage() {
  const router = useRouter();
  const { user, profile, isAuthenticated, isConsultant, isLoading } = useAuth();
  const [consultantProfile, setConsultantProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    headline: '',
    university: '',
    major: [] as string[],
    sat_score: 0,
    num_aps: 0,
    image_url: '',
  });

  // Check authentication on the client side
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Wait for auth to initialize
        if (isLoading) return;

        console.log('Auth state:', { isAuthenticated, isConsultant, user });

        // If not authenticated or not a consultant, redirect to login
        if (!isAuthenticated || !isConsultant) {
          console.log('Not authenticated or not a consultant, redirecting to login');
          toast.error('You must be signed in as a consultant to access this page');
          router.push('/auth/signin?redirect=/profile/consultant/edit-direct');
          return;
        }

        // Fetch the consultant profile
        await fetchConsultantProfile();
      } catch (error) {
        console.error('Error checking authentication:', error);
        toast.error('Authentication error. Please try again.');
      }
    };

    checkAuth();
  }, [isLoading, isAuthenticated, isConsultant, user]);

  // Fetch the consultant profile
  const fetchConsultantProfile = async () => {
    try {
      setLoading(true);
      
      if (!user?.id) {
        console.error('No user ID available');
        toast.error('User information is missing');
        return;
      }

      console.log('Fetching consultant profile for user:', user.id);
      const { data, error } = await supabase
        .from('consultants')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching consultant profile:', error);
        toast.error('Failed to load your profile');
        return;
      }

      if (!data) {
        console.log('No consultant profile found, creating a default one');
        await createDefaultProfile();
        return;
      }

      console.log('Consultant profile loaded:', data);
      setConsultantProfile(data);
      setFormData({
        headline: data.headline || '',
        university: data.university || '',
        major: data.major || [],
        sat_score: data.sat_score || 0,
        num_aps: data.num_aps || 0,
        image_url: data.image_url || 'https://placehold.co/300x300',
      });
    } catch (error) {
      console.error('Error in fetchConsultantProfile:', error);
      toast.error('Failed to load your profile');
    } finally {
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
        headline: 'Coming Soon',
        image_url: 'https://placehold.co/300x300',
        slug: slug,
        university: 'Not specified',
        major: ['Undecided'],
        sat_score: 0,
        num_aps: 0,
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
        headline: data.headline || '',
        university: data.university || '',
        major: data.major || [],
        sat_score: data.sat_score || 0,
        num_aps: data.num_aps || 0,
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
      [name]: name === 'sat_score' || name === 'num_aps' ? parseInt(value) || 0 : value,
    }));
  };

  // Handle major checkbox changes
  const handleMajorChange = (major: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      major: checked
        ? [...prev.major, major]
        : prev.major.filter(m => m !== major),
    }));
  };

  // Save the profile
  const handleSave = async () => {
    try {
      setSaving(true);
      
      if (!consultantProfile?.id) {
        console.error('No consultant profile ID available');
        toast.error('Profile information is missing');
        return;
      }
      
      console.log('Saving profile changes:', formData);
      const { error } = await supabase
        .from('consultants')
        .update(formData)
        .eq('id', consultantProfile.id);
      
      if (error) {
        console.error('Error saving profile:', error);
        toast.error('Failed to save your profile');
        return;
      }
      
      console.log('Profile saved successfully');
      toast.success('Profile saved successfully');
      
      // Redirect to the consultant profile
      router.push(`/mentors/${consultantProfile.slug}`);
    } catch (error) {
      console.error('Error in handleSave:', error);
      toast.error('Failed to save your profile');
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

  // If loading, show a loading spinner
  if (loading || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Loader2 className="h-12 w-12 animate-spin text-main mb-4" />
        <h1 className="text-2xl font-bold">Loading your profile...</h1>
        <p className="text-gray-500 mt-2">This will just take a moment</p>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto p-4 py-8">
      <div className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white p-6 mb-8">
        <h1 className="text-3xl font-bold mb-6">Edit Your Mentor Profile</h1>
        
        <div className="space-y-6">
          {/* Headline */}
          <div>
            <Label htmlFor="headline" className="text-lg font-medium mb-2 block">
              Headline
            </Label>
            <Textarea
              id="headline"
              name="headline"
              value={formData.headline}
              onChange={handleInputChange}
              placeholder="A brief headline for your profile"
              className="w-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            />
          </div>
          
          {/* University */}
          <div>
            <Label htmlFor="university" className="text-lg font-medium mb-2 block">
              University
            </Label>
            <Input
              id="university"
              name="university"
              value={formData.university}
              onChange={handleInputChange}
              placeholder="Your university"
              className="w-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            />
          </div>
          
          {/* Major */}
          <div>
            <Label className="text-lg font-medium mb-2 block">
              Major(s)
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {availableMajors.map(major => (
                <div key={major} className="flex items-center space-x-2">
                  <Checkbox
                    id={`major-${major}`}
                    checked={formData.major.includes(major)}
                    onCheckedChange={(checked) => 
                      handleMajorChange(major, checked as boolean)
                    }
                    className="border-2 border-black"
                  />
                  <Label htmlFor={`major-${major}`} className="cursor-pointer">
                    {major}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          
          {/* SAT Score */}
          <div>
            <Label htmlFor="sat_score" className="text-lg font-medium mb-2 block">
              SAT Score
            </Label>
            <Input
              id="sat_score"
              name="sat_score"
              type="number"
              value={formData.sat_score}
              onChange={handleInputChange}
              placeholder="Your SAT score"
              className="w-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            />
          </div>
          
          {/* Number of APs */}
          <div>
            <Label htmlFor="num_aps" className="text-lg font-medium mb-2 block">
              Number of AP Courses
            </Label>
            <Input
              id="num_aps"
              name="num_aps"
              type="number"
              value={formData.num_aps}
              onChange={handleInputChange}
              placeholder="Number of AP courses taken"
              className="w-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            />
          </div>
          
          {/* Profile Image URL */}
          <div>
            <Label htmlFor="image_url" className="text-lg font-medium mb-2 block">
              Profile Image URL
            </Label>
            <Input
              id="image_url"
              name="image_url"
              value={formData.image_url}
              onChange={handleInputChange}
              placeholder="URL to your profile image"
              className="w-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            />
            {formData.image_url && (
              <div className="mt-2">
                <p className="text-sm text-gray-500 mb-2">Preview:</p>
                <img 
                  src={formData.image_url} 
                  alt="Profile preview" 
                  className="w-24 h-24 object-cover border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  onError={(e) => {
                    e.currentTarget.src = 'https://placehold.co/300x300';
                  }}
                />
              </div>
            )}
          </div>
          
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
    </div>
  );
}
