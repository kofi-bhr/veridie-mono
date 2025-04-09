'use client';

import { useState } from 'react';
import Link from 'next/link';
import { z } from 'zod';
import useSupabaseAuth from '@/lib/auth/useSupabaseAuth';
import AuthForm from './AuthForm';

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type SignInFormValues = z.infer<typeof signInSchema>;

const SignInForm = () => {
  const { loading, error, handleSignIn } = useSupabaseAuth();
  const [formError, setFormError] = useState<string | null>(error);

  const onSubmit = async (values: SignInFormValues) => {
    const { success, error } = await handleSignIn(values.email, values.password);
    if (!success && error) {
      setFormError(error);
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
      placeholder: 'Enter your password',
    },
  ];

  return (
    <div className="w-full max-w-md mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Sign In</h1>
        <p className="mt-2 text-muted-foreground">
          Welcome back! Sign in to your account
        </p>
      </div>

      <AuthForm
        onSubmit={onSubmit}
        formSchema={signInSchema}
        fields={fields}
        submitText="Sign In"
        isLoading={loading}
        error={formError}
      />

      <div className="text-center space-y-4">
        <p>
          <Link 
            href="/auth/reset-password" 
            className="text-main hover:underline font-medium"
            tabIndex={0}
            aria-label="Reset password"
          >
            Forgot your password?
          </Link>
        </p>
        <p>
          Don't have an account?{' '}
          <Link 
            href="/auth/signup" 
            className="text-main hover:underline font-medium"
            tabIndex={0}
            aria-label="Sign up for an account"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignInForm;
