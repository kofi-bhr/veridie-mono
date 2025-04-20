// /Users/kofihairralson/CascadeProjects/neobrutalism-nextjs/veridie-mono/src/components/auth/__tests__/SignUpForm.test.tsx
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import SignUpForm from '../SignUpForm';

// Create mock function for signUp
const mockSignUp = vi.fn();
const mockUseSupabaseAuth = vi.fn(() => ({
  signUp: mockSignUp,
  isLoading: false,
  error: null,
}));

// Mock the useSupabaseAuth hook - must be before importing it
vi.mock('@/lib/auth/useSupabaseAuth', () => ({
  useSupabaseAuth: () => mockUseSupabaseAuth(),
}));

// Import after mock
import { useSupabaseAuth } from '@/lib/auth/useSupabaseAuth';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
  })),
}));

// Mock Next.js Link component
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Mock Shadcn Form components
vi.mock('@/components/ui/form', () => ({
  Form: ({ children, onSubmit }: { children: React.ReactNode; onSubmit: () => void }) => (
    <form onSubmit={onSubmit}>{children}</form>
  ),
  FormField: ({ render }: { render: Function }) => 
    render({ field: { value: '', onChange: vi.fn(), onBlur: vi.fn() } }),
  FormItem: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  FormLabel: ({ children }: { children: React.ReactNode }) => <label>{children}</label>,
  FormControl: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  FormMessage: ({ children }: { children?: React.ReactNode }) => 
    children ? <div role="alert">{children}</div> : null,
}));

// Mock Shadcn Input
vi.mock('@/components/ui/input', () => ({
  Input: React.forwardRef((props: any, ref: any) => <input ref={ref} {...props} />),
}));

// Mock Shadcn Button
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: { children: React.ReactNode; [key: string]: any }) => (
    <button {...props}>{children}</button>
  ),
}));

describe('SignUpForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSupabaseAuth.mockReturnValue({
      signUp: mockSignUp,
      isLoading: false,
      error: null,
    });
  });

  it('renders sign up form with all required fields', () => {
    render(<SignUpForm />);
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
    expect(screen.getByText(/already have an account/i)).toBeInTheDocument();
  });

  it('validates email format', async () => {
    render(<SignUpForm />);
    const emailInput = screen.getByLabelText(/email/i);
    
    await userEvent.type(emailInput, 'invalid-email');
    fireEvent.blur(emailInput);
    
    expect(await screen.findByRole('alert')).toHaveTextContent(/valid email/i);
  });

  it('validates password requirements', async () => {
    render(<SignUpForm />);
    const passwordInput = screen.getByLabelText(/password/i);
    
    await userEvent.type(passwordInput, 'short');
    fireEvent.blur(passwordInput);
    
    expect(await screen.findByRole('alert')).toHaveTextContent(/at least 8 characters/i);
  });

  it('handles successful form submission', async () => {
    const user = userEvent.setup();
    render(<SignUpForm />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('displays loading state during submission', () => {
    vi.mocked(useSupabaseAuth).mockReturnValue({
      signUp: mockSignUp,
      isLoading: true,
      error: null,
    });

    render(<SignUpForm />);
    
    const submitButton = screen.getByRole('button', { name: /signing up/i });
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent(/signing up/i);
  });

  it('displays error message when sign up fails', () => {
    vi.mocked(useSupabaseAuth).mockReturnValue({
      signUp: mockSignUp,
      isLoading: false,
      error: 'Sign up failed',
    });

    render(<SignUpForm />);
    expect(screen.getByText('Sign up failed')).toBeInTheDocument();
  });

  it('prevents form submission with empty fields', async () => {
    const user = userEvent.setup();
    render(<SignUpForm />);

    await user.click(screen.getByRole('button', { name: /sign up/i }));

    expect(mockSignUp).not.toHaveBeenCalled();
    expect(await screen.findAllByRole('alert')).toHaveLength(2); // Both email and password errors
  });

  it('handles network errors during submission', async () => {
    const networkError = new Error('Network error');
    mockSignUp.mockRejectedValueOnce(networkError);

    const user = userEvent.setup();
    render(<SignUpForm />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /sign up/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/network error/i);
  });

  it('navigates to sign in page when clicking the link', async () => {
    const user = userEvent.setup();
    render(<SignUpForm />);

    const signInLink = screen.getByText(/already have an account/i);
    await user.click(signInLink);

    expect(signInLink).toHaveAttribute('href', '/signin');
  });
});
