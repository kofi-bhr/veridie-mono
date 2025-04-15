'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';

export default function ConsultantProfileEditPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/auth/signin?redirect=/profile/consultant/edit-direct');
      } else {
        router.push('/profile/consultant/edit-direct');
      }
    }
  }, [authLoading, isAuthenticated, router]);

  return null;
} 