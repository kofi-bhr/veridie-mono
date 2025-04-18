import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SignUpForm from '../SignUpForm';
import { useSupabaseAuth } from '@/lib/auth/useSupabaseAuth';

// Mock the useSupabaseAuth hook
vi.mock('@/lib/auth/useSupabaseAuth', () => ({
  useSupabaseAuth: vi.fn(),
}));

describe('SignUpForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders sign up form correctly', () => {
    const mockSignUp = vi.fn();
    vi.mocked(useSupabaseAuth).mockReturnValue({
      signUp: mockSignUp,
      isLoading: false,
      error: null,
    });

    render(<SignUpForm />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });

  it('handles form submission correctly', async () => {
    const mockSignUp = vi.fn();
    vi.mocked(useSupabaseAuth).mockReturnValue({
      signUp: mockSignUp,
      isLoading: false,
      error: null,
    });

    render(<SignUpForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign up/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('displays loading state during submission', () => {
    vi.mocked(useSupabaseAuth).mockReturnValue({
      signUp: vi.fn(),
      isLoading: true,
      error: null,
    });

    render(<SignUpForm />);

    expect(screen.getByRole('button', { name: /signing up/i })).toBeDisabled();
  });

  it('displays error message when sign up fails', () => {
    vi.mocked(useSupabaseAuth).mockReturnValue({
      signUp: vi.fn(),
      isLoading: false,
      error: 'Sign up failed',
    });

    render(<SignUpForm />);

    expect(screen.getByText('Sign up failed')).toBeInTheDocument();
  });
}); 