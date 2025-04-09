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
};

const ProfileForm = ({ initialRole = null }: ProfileFormProps) => {
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
      
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          first_name: values.firstName,
          last_name: values.lastName,
          role: initialRole || 'student',
        });

      if (error) throw error;
      
      // If user is signing up as a consultant, redirect to consultant onboarding
      if (initialRole === 'consultant') {
        router.push('/profile/consultant-setup');
      } else {
        router.push('/');
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message);
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
      <div className="text-center">
        <h1 className="text-3xl font-bold">Complete Your Profile</h1>
        <p className="mt-2 text-muted-foreground">
          {initialRole === 'consultant' 
            ? 'Tell us about yourself to get started as a mentor' 
            : 'Tell us a bit about yourself'}
        </p>
      </div>

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
