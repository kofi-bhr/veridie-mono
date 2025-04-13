'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import useSupabaseAuth from '@/lib/auth/useSupabaseAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'; 
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'; 
import { checkSupabaseConnection } from '@/lib/supabase/client';
import { toast } from 'sonner';

const signUpSchema = z
  .object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'), 
    confirmPassword: z.string().min(8, 'Password must be at least 8 characters'),
    role: z.enum(['student', 'consultant'], { required_error: 'Please select a role' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type SignUpFormValues = z.infer<typeof signUpSchema>;

const SignUpForm = () => {
  const { loading, error: authApiError, handleSignUp } = useSupabaseAuth();
  const [apiError, setApiError] = useState<string | null>(authApiError);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [longOperation, setLongOperation] = useState(false);
  
  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      role: undefined,
    },
  });

  // Effect to detect unusually long loading states
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (loading && submitAttempted) {
      timer = setTimeout(() => {
        // If still loading after 10 seconds, show a message
        setLongOperation(true);
        // Check Supabase connection
        checkSupabaseConnection().then(result => {
          if (!result.connected) {
            console.error('Supabase connection check failed during signup', result.error);
            setApiError(`Connection issue detected: ${result.error || 'Unable to reach our servers'}. Please try again.`);
          }
        });
      }, 10000);
    } else {
      setLongOperation(false);
    }
    
    return () => clearTimeout(timer);
  }, [loading, submitAttempted]);

  const onSubmit = async (values: SignUpFormValues) => {
    try {
      console.log('Form submitted with values:', { ...values, password: '[REDACTED]' });
      setApiError(null);
      setSubmitAttempted(true);
      
      // Manually control loading state to ensure it's working correctly
      form.reset(form.getValues(), { keepValues: true, keepDirty: false });
      
      // Check connection before proceeding
      const connectionCheck = await checkSupabaseConnection();
      if (!connectionCheck.connected) {
        console.error('Supabase connection check failed before signup', connectionCheck.error);
        setApiError(`Connection issue detected: ${connectionCheck.error || 'Unable to reach our servers'}. Please try again later.`);
        setSubmitAttempted(false);
        return;
      }
      
      // Add a backup timeout to reset the loading state in case of issues
      const failsafeTimer = setTimeout(() => {
        if (submitAttempted) {
          console.error('Manual failsafe triggered: Form has been submitting for too long');
          setSubmitAttempted(false);
          setApiError('The signup process is taking longer than expected. Please try again or contact support if the issue persists.');
          toast.error('Signup operation timed out');
          
          // Force reload the page if we're still stuck
          setTimeout(() => {
            if (typeof window !== 'undefined') {
              window.location.reload();
            }
          }, 3000);
        }
      }, 20000);
      
      const { success, error } = await handleSignUp(values.email, values.password, values.role);
      
      clearTimeout(failsafeTimer);
      
      if (!success && error) {
        console.error('Signup failed with error:', error);
        setApiError(error);
      } else {
        console.log('Signup completed successfully');
      }
    } catch (err) {
      console.error('Unexpected error during signup:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setApiError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSubmitAttempted(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Create an Account</h1>
        <p className="mt-2 text-muted-foreground">
          Join Veridie as a Student or Consultant
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 border-2 border-black p-6 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-md">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your email" type="email" {...field} className="border-black" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input placeholder="Create a password (min. 8 chars)" type="password" {...field} className="border-black" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input placeholder="Confirm your password" type="password" {...field} className="border-black" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>I am signing up as a...</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0 border border-black px-3 py-2 rounded hover:bg-gray-50">
                      <FormControl>
                        <RadioGroupItem value="student" className="border-black text-main focus:ring-main" />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer">
                        Student
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0 border border-black px-3 py-2 rounded hover:bg-gray-50">
                      <FormControl>
                        <RadioGroupItem value="consultant" className="border-black text-main focus:ring-main" />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer">
                        Consultant / Mentor
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {apiError && (
            <p className="text-sm font-medium text-destructive bg-red-100 p-3 rounded border border-destructive">{apiError}</p>
          )}
          
          {longOperation && !apiError && (
            <p className="text-sm font-medium text-amber-800 bg-amber-100 p-3 rounded border border-amber-300">
              This is taking longer than expected. We're still trying to create your account. Please be patient...
            </p>
          )}

          <Button 
            type="submit" 
            className="w-full border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" 
            disabled={loading}
          >
            {loading ? 'Signing Up...' : 'Sign Up'}
          </Button>
          
          {loading && submitAttempted && (
            <p className="text-xs text-center text-gray-500 mt-2">
              Creating your account... This may take a few moments.
            </p>
          )}
        </form>
      </Form>

      <div className="text-center mt-4">
        <p className="text-sm">
          Already have an account?{' '}
          <Link 
            href="/auth/signin" 
            className="text-main hover:underline font-medium"
            tabIndex={0}
            aria-label="Sign in to your account"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUpForm;
