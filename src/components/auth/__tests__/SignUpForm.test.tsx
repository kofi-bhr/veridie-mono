// /Users/kofihairralson/CascadeProjects/neobrutalism-nextjs/veridie-mono/src/components/auth/__tests__/SignUpForm.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SignUpForm from '../SignUpForm';
import { useSupabaseAuth } from '@/lib/auth/useSupabaseAuth';

// Mock the useSupabaseAuth hook
vi.mock('@/lib/auth/useSupabaseAuth');

// Mock Next.js Link component
vi.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

const mockHandleSignUp = vi.fn();
const mockUseSupabaseAuth = useSupabaseAuth as unknown as ReturnType<typeof vi.fn>;

// Mock Shadcn Form components (basic mock for structure)
vi.mock('../../ui/form', () => ({
  ...vi.requireActual('../../ui/form'), // Use actual implementation for structure if possible
  Form: ({ children }: { children: React.ReactNode }) => <form>{children}</form>,
  FormField: ({ render, name }: { render: Function, name: string }) => render({ field: { name, value: '', onChange: vi.fn(), onBlur: vi.fn() } }),
  FormItem: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  FormLabel: ({ children }: { children: React.ReactNode }) => <label>{children}</label>,
  FormControl: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  FormMessage: ({ children }: { children?: React.ReactNode }) => children ? <div>{children}</div> : null,
 }));

 // Mock Shadcn Input
vi.mock('../../ui/input', () => ({
  Input: React.forwardRef((props: any, ref: any) => <input ref={ref} {...props} />),
}));

// Mock Shadcn Button
vi.mock('../../ui/button', () => ({
  Button: ({ children, ...props }: { children: React.ReactNode, [key: string]: any }) => (
    <button {...props}>{children}</button>
  ),
}));

describe('SignUpForm', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockUseSupabaseAuth.mockReturnValue({
      handleSignUp: mockHandleSignUp,
      loading: false,
      error: null,
    });
  });

  it('renders sign up form', () => {
    render(<SignUpForm />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });

  it('handles form submission', async () => {
    render(<SignUpForm />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign up/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    expect(mockHandleSignUp).toHaveBeenCalledWith('test@example.com', 'password123');
  });

  it('displays loading state', () => {
    mockUseSupabaseAuth.mockReturnValue({
      handleSignUp: mockHandleSignUp,
      loading: true,
      error: null,
    });

    render(<SignUpForm />);
    expect(screen.getByRole('button', { name: /loading/i })).toBeDisabled();
  });

  it('displays error message', () => {
    mockUseSupabaseAuth.mockReturnValue({
      handleSignUp: mockHandleSignUp,
      loading: false,
      error: 'Invalid email',
    });

    render(<SignUpForm />);
    expect(screen.getByText('Invalid email')).toBeInTheDocument();
  });
});
