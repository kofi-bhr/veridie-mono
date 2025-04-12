import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Hero from '@/components/home/Hero';
import Features from '@/components/home/Features';
import UniversityMarquee from '@/components/home/UniversityMarquee';
import Testimonials from '@/components/home/Testimonials';
import CallToAction from '@/components/home/CallToAction';
import Footer from '@/components/layout/Footer';

const About = () => {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        <div className="pt-20">
          <Hero />
          <div className="py-8 md:py-12">
            <h3 className="text-center text-lg md:text-xl font-medium mb-6">Our mentors come from top universities</h3>
            <UniversityMarquee />
          </div>
          <Features />
          <Testimonials />
          <CallToAction />
        </div>
      </main>
      <Footer />
    </>
  );
};

export default About; 