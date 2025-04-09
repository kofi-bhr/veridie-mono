import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ConsultantNotFound() {
  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4 flex flex-col items-center justify-center text-center">
        <h1 className="text-4xl font-bold mb-4">Consultant Not Found</h1>
        <p className="text-lg mb-8 max-w-lg">
          We couldn&apos;t find the consultant you&apos;re looking for. They may have changed their profile or the URL might be incorrect.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild variant="reverse" className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <Link href="/mentors">
              Browse All Consultants
            </Link>
          </Button>
          <Button asChild>
            <Link href="/">
              Return to Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
