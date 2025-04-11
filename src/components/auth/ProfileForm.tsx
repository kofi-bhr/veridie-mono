'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth/AuthContext';
import AuthForm from './AuthForm';
import { Button } from '@/components/ui/button';

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

type ProfileFormProps = {
  initialRole?: string | null;
  onSuccess?: () => void;
};

const ProfileForm = ({ initialRole = null, onSuccess }: ProfileFormProps) => {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (values: ProfileFormValues) => {
    if (!user) {
      setError('You must be logged in to update your profile');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('ProfileForm: Updating profile for user:', user.id);
      console.log('ProfileForm: Values:', values);
      
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          first_name: values.firstName,
          last_name: values.lastName,
          role: initialRole || 'student',
          email: user.email,
        });

      if (error) {
        console.error('ProfileForm: Error updating profile:', error);
        throw error;
      }
      
      console.log('ProfileForm: Profile updated successfully');
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        console.log('ProfileForm: Calling onSuccess callback');
        onSuccess();
      }
      
      // If user is signing up as a consultant, redirect to consultant onboarding
      if (initialRole === 'consultant') {
        console.log('ProfileForm: Redirecting to consultant setup');
        router.push('/profile/consultant-setup');
      } else if (!onSuccess) {
        // Only redirect if onSuccess callback is not provided
        console.log('ProfileForm: Redirecting to profile page');
        router.push('/profile');
      }
      
      router.refresh();
    } catch (err: any) {
      console.error('ProfileForm: Error in onSubmit:', err);
      setError(err.message || 'An error occurred while updating your profile');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    {
      name: 'firstName',
      label: 'First Name',
      type: 'text',
      placeholder: 'Enter your first name',
    },
    {
      name: 'lastName',
      label: 'Last Name',
      type: 'text',
      placeholder: 'Enter your last name',
    },
  ];

  return (
    <div className="w-full max-w-md mx-auto space-y-8">
      {!onSuccess && (
        <div className="text-center">
          <h1 className="text-3xl font-bold">Complete Your Profile</h1>
          <p className="mt-2 text-muted-foreground">
            {initialRole === 'consultant' 
              ? 'Tell us about yourself to get started as a mentor' 
              : 'Tell us a bit about yourself'}
          </p>
        </div>
      )}

      <AuthForm
        onSubmit={onSubmit}
        formSchema={profileSchema}
        fields={fields}
        submitText="Save Profile"
        isLoading={loading}
        error={error}
      />
    </div>
  );
};

export default ProfileForm;
