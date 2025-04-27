import { vi } from 'vitest';

const useSupabaseAuth = vi.fn(() => ({
  user: null,
  signUp: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
  loading: false,
  error: null,
}));

const useAuth = vi.fn(() => ({
  user: null,
  loading: false,
  error: null,
}));

export default useSupabaseAuth;
export { useAuth };
