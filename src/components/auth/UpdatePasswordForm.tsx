'use client';

import { useState } from 'react';
import Link from 'next/link';
import { z } from 'zod';
import { useSupabaseAuth } from '@/lib/auth';
import PasswordForm from './PasswordForm';
import { toast } from 'sonner';

const updatePasswordSchema = z
  .object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type UpdatePasswordFormValues = z.infer<typeof updatePasswordSchema>;

const UpdatePasswordForm = () => {
  const { loading, error, updatePassword } = useSupabaseAuth();
  const [formError, setFormError] = useState<string | null>(error);
  const [success, setSuccess] = useState(false);

  const onSubmit = async (values: UpdatePasswordFormValues) => {
    try {
      await updatePassword(values.password);
      setSuccess(true);
    } catch (err: any) {
      const message = err.message || 'An error occurred while updating password';
      toast.error(message);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-md mx-auto space-y-8 text-center">
        <h1 className="text-2xl font-bold">Password Updated Successfully!</h1>
        <p className="text-gray-600">
          Your password has been updated. You can now use your new password to sign in.
        </p>
        <Link
          href="/auth/signin"
          className="inline-block w-full py-3 px-4 text-center font-bold text-white bg-black rounded-lg hover:bg-gray-800"
        >
          Back to Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Update Password</h1>
        <p className="text-gray-600 mt-2">
          Choose a new password for your account
        </p>
      </div>

      <PasswordForm
        formSchema={updatePasswordSchema}
        submitText="Update Password"
        isLoading={loading}
        error={formError}
        onSubmit={onSubmit}
      />
    </div>
  );
};

export default UpdatePasswordForm;
