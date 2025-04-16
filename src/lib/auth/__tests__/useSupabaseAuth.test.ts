// /Users/kofihairralson/CascadeProjects/neobrutalism-nextjs/veridie-mono/src/lib/auth/__tests__/useSupabaseAuth.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSupabaseAuth } from '../useSupabaseAuth';
import { supabase } from '@/lib/supabase/client'; // Adjust path if needed
import { useRouter } from 'next/navigation';

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
  useRouter: vi.fn(),
}));

const mockPush = vi.fn();
const mockRefresh = vi.fn(); // Though we removed it, keep mock if router is used elsewhere

describe('useSupabaseAuth', () => {
  const mockSignUp = vi.fn();
  const mockSignIn = vi.fn();
  const mockSignOut = vi.fn();
  const mockGetSession = vi.fn();
  const mockOnAuthStateChange = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
    
    // Setup router mock
    (useRouter as vi.Mock).mockReturnValue({
      push: mockPush,
      refresh: mockRefresh,
    });

    // Setup mock implementations
    mockSignUp.mockResolvedValue({ data: {}, error: null });
    mockSignIn.mockResolvedValue({ data: {}, error: null });
    mockSignOut.mockResolvedValue({ error: null });
    mockGetSession.mockResolvedValue({ data: { session: null }, error: null });
    mockOnAuthStateChange.mockImplementation((callback) => {
      callback('INITIAL_SESSION', null);
      return { data: { subscription: { unsubscribe: vi.fn() } }, error: null };
    });

    // Assign mocks to supabase client
    const { supabase } = require('@/lib/supabase/client');
    supabase.auth.signUp = mockSignUp;
    supabase.auth.signInWithPassword = mockSignIn;
    supabase.auth.signOut = mockSignOut;
    supabase.auth.getSession = mockGetSession;
    supabase.auth.onAuthStateChange = mockOnAuthStateChange;
  });

  it('handles sign up', async () => {
    const { result } = renderHook(() => useSupabaseAuth());

    await act(async () => {
      await result.current.handleSignUp('test@example.com', 'password123');
    });

    expect(mockSignUp).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });

  it('handles sign in', async () => {
    const { result } = renderHook(() => useSupabaseAuth());

    await act(async () => {
      await result.current.handleSignIn('test@example.com', 'password123');
    });

    expect(mockSignIn).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });

  it('handles sign out', async () => {
    const { result } = renderHook(() => useSupabaseAuth());

    await act(async () => {
      await result.current.handleSignOut();
    });

    expect(mockSignOut).toHaveBeenCalled();
  });

  it('handles auth state changes', async () => {
    renderHook(() => useSupabaseAuth());

    expect(mockOnAuthStateChange).toHaveBeenCalled();
  });

  it('handles auth errors', async () => {
    const errorMessage = 'Invalid credentials';
    mockSignIn.mockResolvedValueOnce({ data: null, error: { message: errorMessage } });

    const { result } = renderHook(() => useSupabaseAuth());

    await act(async () => {
      await result.current.handleSignIn('test@example.com', 'wrongpassword');
    });

    expect(result.current.error).toBe(errorMessage);
  });

  it('sets loading state during auth operations', async () => {
    const { result } = renderHook(() => useSupabaseAuth());

    await act(async () => {
      const signInPromise = result.current.handleSignIn('test@example.com', 'password123');
      expect(result.current.loading).toBe(true);
      await signInPromise;
    });

    expect(result.current.loading).toBe(false);
  });
});
