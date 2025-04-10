// /Users/kofihairralson/CascadeProjects/neobrutalism-nextjs/veridie-mono/src/components/auth/__tests__/SignUpForm.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SignUpForm from '../SignUpForm';
import useSupabaseAuth from '@/lib/auth/useSupabaseAuth';

// Mock the useSupabaseAuth hook
jest.mock('@/lib/auth/useSupabaseAuth');
const mockHandleSignUp = jest.fn();
const mockUseSupabaseAuth = useSupabaseAuth as jest.Mock;

// Mock Next.js Link component
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

// Mock Shadcn Form components (basic mock for structure)
jest.mock('../../ui/form', () => ({
  ...jest.requireActual('../../ui/form'), // Use actual implementation for structure if possible
  Form: ({ children }: { children: React.ReactNode }) => <form>{children}</form>,
  FormField: ({ render, name }: { render: Function, name: string }) => render({ field: { name, value: '', onChange: jest.fn(), onBlur: jest.fn() } }),
  FormItem: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  FormLabel: ({ children }: { children: React.ReactNode }) => <label>{children}</label>,
  FormControl: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  FormMessage: ({ children }: { children?: React.ReactNode }) => children ? <div>{children}</div> : null,
 }));

 // Mock Shadcn Input
jest.mock('../../ui/input', () => ({
  Input: React.forwardRef((props: any, ref: any) => <input ref={ref} {...props} />),
}));

// Mock Shadcn Button
jest.mock('../../ui/button', () => ({
  Button: ({ children, ...props }: { children: React.ReactNode, [key: string]: any }) => (
    <button {...props}>{children}</button>
  ),
}));

describe('SignUpForm', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    mockUseSupabaseAuth.mockReturnValue({
      loading: false,
      error: null,
      handleSignUp: mockHandleSignUp,
    });
  });

  it('renders the signup form correctly', () => {
    render(<SignUpForm />);
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password$/i)).toBeInTheDocument(); // Match exact label "Password"
    expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument();
    expect(screen.getByText(/I am signing up as a.../i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Student/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Consultant \/ Mentor/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign Up/i })).toBeInTheDocument();
  });

  it('validates input fields and shows error messages', async () => {
    render(<SignUpForm />);
    
    fireEvent.click(screen.getByRole('button', { name: /Sign Up/i }));

    // Use findAllByTestId to wait for potential async validation messages
    const messages = await screen.findAllByTestId('form-message');
    
    // Check for specific error messages (adjust text based on actual Zod messages)
    // Note: The exact text depends on how FormMessage renders Zod errors.
    // This example assumes the message appears near the respective input.
    // A more robust approach might involve checking aria-invalid attributes or specific error elements.
    await waitFor(() => {
        // Expect validation messages to appear for required fields
        expect(screen.getByLabelText(/Email/i).closest('div')).toHaveTextContent(/invalid email/i); // Or required message
        expect(screen.getByLabelText(/^Password$/i).closest('div')).toHaveTextContent(/at least 8 characters/i); // Or required
        expect(screen.getByLabelText(/Confirm Password/i).closest('div')).toHaveTextContent(/at least 8 characters/i); // Or required
        expect(screen.getByText(/I am signing up as a.../i).closest('div')).toHaveTextContent(/Please select a role/i);
    });

    // Test password mismatch
    fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: 'password456' } });
    fireEvent.click(screen.getByRole('button', { name: /Sign Up/i }));

    await waitFor(() => {
      // Using getByText within the context of the confirm password field's parent
      const confirmPasswordItem = screen.getByLabelText(/Confirm Password/i).closest('div');
      expect(confirmPasswordItem).toHaveTextContent(/Passwords don't match/i);
    });
  });

  it('calls handleSignUp with correct data on valid submission', async () => {
    mockHandleSignUp.mockResolvedValue({ success: true, data: {} }); // Mock successful signup
    render(<SignUpForm />);

    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByLabelText(/Student/i)); // Select role

    fireEvent.click(screen.getByRole('button', { name: /Sign Up/i }));

    await waitFor(() => {
      expect(mockHandleSignUp).toHaveBeenCalledTimes(1);
      expect(mockHandleSignUp).toHaveBeenCalledWith('test@example.com', 'password123', 'student');
    });
  });
  
   it('calls handleSignUp with consultant role', async () => {
    mockHandleSignUp.mockResolvedValue({ success: true, data: {} }); 
    render(<SignUpForm />);

    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'consultant@example.com' } });
    fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByLabelText(/Consultant \/ Mentor/i)); // Select role

    fireEvent.click(screen.getByRole('button', { name: /Sign Up/i }));

    await waitFor(() => {
      expect(mockHandleSignUp).toHaveBeenCalledTimes(1);
      expect(mockHandleSignUp).toHaveBeenCalledWith('consultant@example.com', 'password123', 'consultant');
    });
  });

  it('displays API error message on failed signup', async () => {
    const errorMessage = 'Email already registered';
    mockHandleSignUp.mockResolvedValue({ success: false, error: errorMessage });
    render(<SignUpForm />);

    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByLabelText(/Student/i));

    fireEvent.click(screen.getByRole('button', { name: /Sign Up/i }));

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });
    
  it('disables submit button while loading', () => {
     mockUseSupabaseAuth.mockReturnValue({
        loading: true, // Set loading to true
        error: null,
        handleSignUp: mockHandleSignUp,
     });
     render(<SignUpForm />);
     expect(screen.getByRole('button', { name: /Signing Up.../i })).toBeDisabled();
  });

});
