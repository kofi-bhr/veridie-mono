// /Users/kofihairralson/CascadeProjects/neobrutalism-nextjs/veridie-mono/src/lib/auth/__tests__/useSupabaseAuth.test.ts
import { renderHook, act, waitFor } from '@testing-library/react';
import useSupabaseAuth from '../useSupabaseAuth';
import { supabase } from '@/lib/supabase/client'; // Adjust path if needed
import { useRouter } from 'next/navigation';

// Mock Supabase client methods
jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      resetPasswordForEmail: jest.fn(),
      updateUser: jest.fn(),
      getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: jest.fn().mockReturnValue({
          data: { subscription: { unsubscribe: jest.fn() } }
      }),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
      upsert: jest.fn(),
    })),
  },
}));

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

const mockPush = jest.fn();
const mockRefresh = jest.fn(); // Though we removed it, keep mock if router is used elsewhere

describe('useSupabaseAuth Hook', () => {
  let mockSupabaseAuthSignUp: jest.Mock;
  let mockSupabaseFromUpsert: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup router mock
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      refresh: mockRefresh,
    });

    // Setup Supabase mocks specifically for this hook's usage
    mockSupabaseAuthSignUp = supabase.auth.signUp as jest.Mock;
    // Need to refine the 'from' mock to return the chainable upsert mock
     mockSupabaseFromUpsert = jest.fn();
    (supabase.from as jest.Mock).mockReturnValue({
        upsert: mockSupabaseFromUpsert,
        // Add mocks for other chains if needed (like select/eq/single used in other parts)
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: null }), // Default mock for other usages
    });

    // Mock initial auth state check (optional, depends on hook complexity)
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({ data: { session: null }, error: null });
    (supabase.auth.onAuthStateChange as jest.Mock).mockImplementation((callback) => {
        // Simulate initial check if needed, then call unsubscribe
         // callback('INITIAL_SESSION', null); // Or 'SIGNED_IN', null/session
         return { data: { subscription: { unsubscribe: jest.fn() } } };
    });
  });

  describe('handleSignUp', () => {
    const email = 'test@example.com';
    const password = 'password123';
    const mockUserId = 'user-123';

    it('should sign up user, create student profile, and redirect to home', async () => {
      mockSupabaseAuthSignUp.mockResolvedValue({
        data: { user: { id: mockUserId } },
        error: null,
      });
      mockSupabaseFromUpsert.mockResolvedValue({ error: null });

      const { result } = renderHook(() => useSupabaseAuth());

      await act(async () => {
        const signUpResult: { success: boolean; error?: string | null } = await result.current.handleSignUp(email, password, 'student');
        expect(signUpResult.success).toBe(true);
        expect(mockSupabaseAuthSignUp).toHaveBeenCalledWith({ email, password });
        expect(supabase.from).toHaveBeenCalledWith('profiles');
        expect(mockSupabaseFromUpsert).toHaveBeenCalledWith(expect.objectContaining({
          id: mockUserId,
          role: 'student',
        }));
        expect(mockPush).toHaveBeenCalledWith('/');
      });
      await waitFor(() => expect(result.current.loading).toBe(false));
      await waitFor(() => expect(result.current.error).toBeNull());
    });

    it('should sign up user, create consultant profile, and redirect to consultant profile', async () => {
       mockSupabaseAuthSignUp.mockResolvedValue({
        data: { user: { id: mockUserId } },
        error: null,
      });
      mockSupabaseFromUpsert.mockResolvedValue({ error: null });
        
      const { result } = renderHook(() => useSupabaseAuth());

      await act(async () => {
        const signUpResult: { success: boolean; error?: string | null } = await result.current.handleSignUp(email, password, 'consultant');
        expect(signUpResult.success).toBe(true);
        expect(mockSupabaseAuthSignUp).toHaveBeenCalledWith({ email, password });
        expect(supabase.from).toHaveBeenCalledWith('profiles');
        expect(mockSupabaseFromUpsert).toHaveBeenCalledWith(expect.objectContaining({
          id: mockUserId,
          role: 'consultant',
        }));
        expect(mockPush).toHaveBeenCalledWith('/profile/consultant');
      });
      await waitFor(() => expect(result.current.loading).toBe(false));
      await waitFor(() => expect(result.current.error).toBeNull());
    });

    it('should handle Supabase auth signup error', async () => {
      const authError = new Error('Auth signup failed');
      mockSupabaseAuthSignUp.mockResolvedValue({ data: null, error: authError });

      const { result } = renderHook(() => useSupabaseAuth());

      await act(async () => {
        const signUpResult: { success: boolean; error?: string | null } = await result.current.handleSignUp(email, password, 'student');
        expect(signUpResult.success).toBe(false);
        expect(signUpResult.error).toBe('Auth signup failed');
        expect(mockSupabaseFromUpsert).not.toHaveBeenCalled();
        expect(mockPush).not.toHaveBeenCalled();
      });
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe('Auth signup failed');
      });
    });

    it('should handle Supabase profile upsert error', async () => {
      const profileError = new Error('Profile upsert failed');
       mockSupabaseAuthSignUp.mockResolvedValue({
        data: { user: { id: mockUserId } },
        error: null,
      });
      mockSupabaseFromUpsert.mockResolvedValue({ error: profileError });

      const { result } = renderHook(() => useSupabaseAuth());

      await act(async () => {
        const signUpResult: { success: boolean; error?: string | null } = await result.current.handleSignUp(email, password, 'student');
        expect(signUpResult.success).toBe(false);
        expect(signUpResult.error).toBe(`Failed to create profile: ${profileError.message}`);
        expect(mockSupabaseAuthSignUp).toHaveBeenCalledWith({ email, password });
        expect(mockSupabaseFromUpsert).toHaveBeenCalledWith(expect.objectContaining({ id: mockUserId, role: 'student' }));
        expect(mockPush).not.toHaveBeenCalled();
      });
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe(`Failed to create profile: ${profileError.message}`);
      });
    });
      
    it('should set loading state during signup', async () => {
       mockSupabaseAuthSignUp.mockResolvedValue({ data: { user: { id: mockUserId } }, error: null });
       mockSupabaseFromUpsert.mockResolvedValue({ error: null });

        const { result } = renderHook(() => useSupabaseAuth());

        // Use act to wrap the async operation start
        act(() => {
            result.current.handleSignUp(email, password, 'student');
        });

        // Check loading state immediately after calling
        expect(result.current.loading).toBe(true);

        // Wait for the operation to complete and check the final state
        await waitFor(() => expect(result.current.loading).toBe(false));
        await waitFor(() => expect(result.current.error).toBeNull());
    });
  });

  // Add describe blocks for handleSignIn, handleSignOut etc. if needed
});
