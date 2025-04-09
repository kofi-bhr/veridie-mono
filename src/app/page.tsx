import Navbar from '@/components/layout/Navbar';
import Hero from '@/components/home/Hero';
import Features from '@/components/home/Features';
import UniversityMarquee from '@/components/home/UniversityMarquee';
import Testimonials from '@/components/home/Testimonials';
import CallToAction from '@/components/home/CallToAction';

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20">
        <Hero />
        
        {/* University Logos Marquee */}
        <div className="py-8 md:py-12">
          <h3 className="text-center text-lg md:text-xl font-medium mb-6">Our mentors come from top universities</h3>
          <UniversityMarquee />
        </div>
        
        <Features />
        <Testimonials />
        <CallToAction />
      </div>
    </main>
  );
}