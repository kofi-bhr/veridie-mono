'use client';

import { useState } from 'react';
import Link from 'next/link';
import { z } from 'zod';
import useSupabaseAuth from '@/lib/auth/useSupabaseAuth';
import AuthForm from './AuthForm';
import { Button } from '@/components/ui/button';

const signUpSchema = z
  .object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type SignUpFormValues = z.infer<typeof signUpSchema>;

const SignUpForm = () => {
  const { loading, error, handleSignUp } = useSupabaseAuth();
  const [formError, setFormError] = useState<string | null>(error);
  const [success, setSuccess] = useState(false);

  const onSubmit = async (values: SignUpFormValues) => {
    const { success, error } = await handleSignUp(values.email, values.password);
    
    if (!success && error) {
      setFormError(error);
    } else {
      setSuccess(true);
    }
  };

  const fields = [
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      placeholder: 'Enter your email',
    },
    {
      name: 'password',
      label: 'Password',
      type: 'password',
      placeholder: 'Create a password',
    },
    {
      name: 'confirmPassword',
      label: 'Confirm Password',
      type: 'password',
      placeholder: 'Confirm your password',
    },
  ];

  if (success) {
    return (
      <div className="w-full max-w-md mx-auto space-y-8 text-center">
        <div className="p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-green-50 rounded-md">
          <h2 className="text-2xl font-bold mb-4">Check your email</h2>
          <p className="mb-6">
            We've sent you a confirmation email. Please check your inbox and follow the instructions to complete your registration.
          </p>
          <Link href="/">
            <Button variant="default" className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              Return to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Create an Account</h1>
        <p className="mt-2 text-muted-foreground">
          Sign up to get started with Veridie
        </p>
      </div>

      <AuthForm
        onSubmit={onSubmit}
        formSchema={signUpSchema}
        fields={fields}
        submitText="Sign Up"
        isLoading={loading}
        error={formError}
      />

      <div className="text-center">
        <p>
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
