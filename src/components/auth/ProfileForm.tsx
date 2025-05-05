'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { AlertCircle } from 'lucide-react';

// Define the profile schema using Zod
const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
});

// Create a type from the schema
export type ProfileFormValues = z.infer<typeof profileSchema>;

// Define props for the ProfileForm component
type ProfileFormProps = {
  initialRole?: string | null;
  onSuccess?: () => void;
};

const ProfileForm = ({ initialRole = null, onSuccess }: ProfileFormProps) => {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize the form with react-hook-form
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
    },
  });

  // Handle form submission
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
    } catch (err: unknown) {
      console.error('ProfileForm: Error in onSubmit:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while updating your profile');
    } finally {
      setLoading(false);
    }
  };

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

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="p-4 border-2 border-red-500 bg-red-50 rounded-md flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          )}

          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base">First Name</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="text"
                    placeholder="Enter your first name"
                    className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 text-base"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base">Last Name</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="text"
                    placeholder="Enter your last name"
                    className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 text-base"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={loading}
            className="w-full border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 text-base font-bold"
          >
            {loading ? 'Loading...' : 'Save Profile'}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default ProfileForm;
