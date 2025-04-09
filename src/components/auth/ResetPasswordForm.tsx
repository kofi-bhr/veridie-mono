'use client';

import { useState } from 'react';
import Link from 'next/link';
import { z } from 'zod';
import useSupabaseAuth from '@/lib/auth/useSupabaseAuth';
import AuthForm from './AuthForm';
import { Button } from '@/components/ui/button';

const resetPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

const ResetPasswordForm = () => {
  const { loading, error, handlePasswordReset } = useSupabaseAuth();
  const [formError, setFormError] = useState<string | null>(error);
  const [success, setSuccess] = useState(false);

  const onSubmit = async (values: ResetPasswordFormValues) => {
    const { success, error } = await handlePasswordReset(values.email);
    
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
  ];

  if (success) {
    return (
      <div className="w-full max-w-md mx-auto space-y-8 text-center">
        <div className="p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-green-50 rounded-md">
          <h2 className="text-2xl font-bold mb-4">Check your email</h2>
          <p className="mb-6">
            We've sent you a password reset link. Please check your inbox and follow the instructions to reset your password.
          </p>
          <Link href="/auth/signin">
            <Button variant="default" className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              Return to Sign In
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Reset Password</h1>
        <p className="mt-2 text-muted-foreground">
          Enter your email to receive a password reset link
        </p>
      </div>

      <AuthForm
        onSubmit={onSubmit}
        formSchema={resetPasswordSchema}
        fields={fields}
        submitText="Send Reset Link"
        isLoading={loading}
        error={formError}
      />

      <div className="text-center">
        <p>
          Remember your password?{' '}
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

export default ResetPasswordForm;
