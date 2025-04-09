'use client';

import { useState } from 'react';
import Link from 'next/link';
import { z } from 'zod';
import useSupabaseAuth from '@/lib/auth/useSupabaseAuth';
import AuthForm from './AuthForm';
import { Button } from '@/components/ui/button';

const updatePasswordSchema = z
  .object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type UpdatePasswordFormValues = z.infer<typeof updatePasswordSchema>;

const UpdatePasswordForm = () => {
  const { loading, error, handleUpdatePassword } = useSupabaseAuth();
  const [formError, setFormError] = useState<string | null>(error);
  const [success, setSuccess] = useState(false);

  const onSubmit = async (values: UpdatePasswordFormValues) => {
    const { success, error } = await handleUpdatePassword(values.password);
    
    if (!success && error) {
      setFormError(error);
    } else {
      setSuccess(true);
    }
  };

  const fields = [
    {
      name: 'password',
      label: 'New Password',
      type: 'password',
      placeholder: 'Enter your new password',
    },
    {
      name: 'confirmPassword',
      label: 'Confirm Password',
      type: 'password',
      placeholder: 'Confirm your new password',
    },
  ];

  if (success) {
    return (
      <div className="w-full max-w-md mx-auto space-y-8 text-center">
        <div className="p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-green-50 rounded-md">
          <h2 className="text-2xl font-bold mb-4">Password Updated</h2>
          <p className="mb-6">
            Your password has been successfully updated. You can now sign in with your new password.
          </p>
          <Link href="/auth/signin">
            <Button variant="default" className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Update Password</h1>
        <p className="mt-2 text-muted-foreground">
          Create a new password for your account
        </p>
      </div>

      <AuthForm
        onSubmit={onSubmit}
        formSchema={updatePasswordSchema}
        fields={fields}
        submitText="Update Password"
        isLoading={loading}
        error={formError}
      />
    </div>
  );
};

export default UpdatePasswordForm;
