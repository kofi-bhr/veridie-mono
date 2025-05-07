'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { AlertCircle, User, GraduationCap } from 'lucide-react';

const RoleSelectionForm = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<'student' | 'consultant' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!selectedRole) {
      setError('Please select a role to continue');
      return;
    }

    if (!user) {
      setError('You must be logged in to complete this step');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // Update both profile and user metadata with the selected role
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          role: selectedRole
        });

      if (profileError) throw profileError;

      // Update user metadata
      const { error: metadataError } = await supabase.auth.updateUser({
        data: { role: selectedRole }
      });

      if (metadataError) throw metadataError;

      // If the user selected consultant, also create a consultant record
      if (selectedRole === 'consultant') {
        const { error: consultantError } = await supabase
          .from('consultants')
          .upsert({
            user_id: user.id,
            // Default values
            university: '',
            sat_score: 0,
            num_aps: 0,
            image_url: '',
            major: []
          });

        if (consultantError) throw consultantError;
        
        // Redirect to consultant profile setup
        router.push('/profile/consultant/edit-direct');
      } else {
        // Redirect to homepage for students
        router.push('/');
      }
      
      router.refresh();
    } catch (err: any) {
      console.error('Error setting role:', err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Choose Your Role</h1>
        <p className="mt-2 text-muted-foreground">
          Select how you want to use Veridie
        </p>
      </div>

      {error && (
        <div className="p-4 border-2 border-red-500 bg-red-50 rounded-md flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          whileHover={{ y: -5 }}
          whileTap={{ y: 0 }}
        >
          <Card 
            className={`border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 cursor-pointer h-full ${
              selectedRole === 'student' ? 'bg-main/10 border-main' : ''
            }`}
            onClick={() => setSelectedRole('student')}
          >
            <div className="flex flex-col items-center text-center h-full">
              <div className="w-16 h-16 bg-main/10 rounded-full flex items-center justify-center mb-4">
                <User className="h-8 w-8 text-main" />
              </div>
              <h2 className="text-xl font-bold mb-2">I'm a Student</h2>
              <p className="text-gray-600 mb-4">
                I want to find mentors and get help with my college applications
              </p>
              {selectedRole === 'student' && (
                <div className="mt-auto">
                  <div className="inline-block px-3 py-1 bg-main text-black text-sm font-medium rounded-full">
                    Selected
                  </div>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        <motion.div
          whileHover={{ y: -5 }}
          whileTap={{ y: 0 }}
        >
          <Card 
            className={`border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 cursor-pointer h-full ${
              selectedRole === 'consultant' ? 'bg-main/10 border-main' : ''
            }`}
            onClick={() => setSelectedRole('consultant')}
          >
            <div className="flex flex-col items-center text-center h-full">
              <div className="w-16 h-16 bg-main/10 rounded-full flex items-center justify-center mb-4">
                <GraduationCap className="h-8 w-8 text-main" />
              </div>
              <h2 className="text-xl font-bold mb-2">I'm a Mentor</h2>
              <p className="text-gray-600 mb-4">
                I want to help students with their college applications and earn money
              </p>
              {selectedRole === 'consultant' && (
                <div className="mt-auto">
                  <div className="inline-block px-3 py-1 bg-main text-black text-sm font-medium rounded-full">
                    Selected
                  </div>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>

      <div className="flex justify-center pt-6">
        <Button
          onClick={handleSubmit}
          disabled={!selectedRole || isSubmitting}
          className="px-8 py-6 text-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
        >
          {isSubmitting ? 'Processing...' : 'Continue'}
        </Button>
      </div>
    </div>
  );
};

export default RoleSelectionForm;
