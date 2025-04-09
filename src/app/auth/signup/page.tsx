import { Metadata } from 'next';
import SignUpForm from '@/components/auth/SignUpForm';

export const metadata: Metadata = {
  title: 'Sign Up | Veridie',
  description: 'Create a new Veridie account',
};

const SignUpPage = () => {
  return (
    <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center min-h-screen">
      <div className="w-full max-w-md border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white p-8 rounded-md">
        <SignUpForm />
      </div>
    </div>
  );
};

export default SignUpPage;
