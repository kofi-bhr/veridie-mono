// /Users/kofihairralson/CascadeProjects/neobrutalism-nextjs/veridie-mono/src/lib/auth/__tests__/useSupabaseAuth.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useSupabaseAuth from '../useSupabaseAuth';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    loading: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
    dismiss: vi.fn(),
  },
}));

// Mock Supabase client methods
vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      updateUser: vi.fn(),
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
      upsert: vi.fn(),
    })),
  },
}));

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

describe('useSupabaseAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup mock implementations
    vi.mocked(supabase.auth.signUp).mockResolvedValue({ data: { user: { id: 'test-user-id' } }, error: null });
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({ 
      data: { 
        user: { id: 'test-user-id' },
        session: { user: { id: 'test-user-id' } }
      }, 
      error: null 
    });
    vi.mocked(supabase.auth.signOut).mockResolvedValue({ error: null });
    vi.mocked(supabase.auth.getSession).mockResolvedValue({ data: { session: null }, error: null });
    vi.mocked(supabase.auth.onAuthStateChange).mockImplementation((callback) => {
      callback('INITIAL_SESSION', null);
      return { data: { subscription: { unsubscribe: vi.fn() } }, error: null };
    });

    // Mock profiles query response
    vi.mocked(supabase.from).mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { role: 'student' }, error: null }),
      upsert: vi.fn().mockResolvedValue({ error: null }),
    }));
  });

  it('handles sign up', async () => {
    const { result } = renderHook(() => useSupabaseAuth());

    await act(async () => {
      await result.current.handleSignUp('test@example.com', 'password123', 'student');
    });

    expect(supabase.auth.signUp).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
      options: {
        data: {
          role: 'student',
        },
      },
    });
  });

  it('handles sign in', async () => {
    const { result } = renderHook(() => useSupabaseAuth());

    await act(async () => {
      await result.current.handleSignIn('test@example.com', 'password123');
    });

    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });

  it('handles sign out', async () => {
    const { result } = renderHook(() => useSupabaseAuth());

    await act(async () => {
      await result.current.handleSignOut();
    });

    expect(supabase.auth.signOut).toHaveBeenCalled();
  });

  it('handles auth state changes', async () => {
    renderHook(() => useSupabaseAuth());
    expect(supabase.auth.onAuthStateChange).toHaveBeenCalled();
  });

  it('handles auth errors', async () => {
    const errorMessage = 'Invalid credentials';
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({ data: null, error: { message: errorMessage } });

    const { result } = renderHook(() => useSupabaseAuth());

    await act(async () => {
      await result.current.handleSignIn('test@example.com', 'wrongpassword');
    });

    expect(result.current.error).toBe(errorMessage);
  });

  it('sets loading state during auth operations', async () => {
    let resolveSignIn: (value: any) => void;
    const signInPromise = new Promise((resolve) => {
      resolveSignIn = resolve;
    });

    vi.mocked(supabase.auth.signInWithPassword).mockImplementationOnce(() => {
      return signInPromise as Promise<any>;
    });

    const { result } = renderHook(() => useSupabaseAuth());

    let signInComplete = false;
    act(() => {
      result.current.handleSignIn('test@example.com', 'password123').then(() => {
        signInComplete = true;
      });
    });

    // Loading should be true immediately after starting
    expect(result.current.loading).toBe(true);

    // Resolve the sign in
    await act(async () => {
      resolveSignIn!({ 
        data: { 
          user: { id: 'test-user-id' },
          session: { user: { id: 'test-user-id' } }
        }, 
        error: null 
      });
      await Promise.resolve(); // Flush promises
    });

    // Loading should be false after completion
    expect(result.current.loading).toBe(false);
    expect(signInComplete).toBe(true);
  });
});
