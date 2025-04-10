'use client';

import { useState } from 'react';
import Link from 'next/link';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import useSupabaseAuth from '@/lib/auth/useSupabaseAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'; 
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'; 

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

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      role: undefined,
    },
  });

  const onSubmit = async (values: SignUpFormValues) => {
    setApiError(null);
    const { success, error } = await handleSignUp(values.email, values.password, values.role);
    
    if (!success && error) {
      setApiError(error);
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

          <Button 
            type="submit" 
            className="w-full border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" 
            disabled={loading}
          >
            {loading ? 'Signing Up...' : 'Sign Up'}
          </Button>
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
