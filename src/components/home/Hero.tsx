'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

const Hero = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="relative overflow-hidden">
      {/* Mobile Hero */}
      <div className="md:hidden">
        <div className="pt-8 pb-16 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-4xl font-bold mb-4">
              Connect with <span className="text-main">Elite</span> College Consultants
            </h1>
            <p className="text-lg mb-8">
              Get personalized guidance from top-tier mentors who've been there, done that.
            </p>
            <div className="flex flex-col gap-4">
              <Button asChild size="lg" className="w-full">
                <Link href="/mentors">Find a Mentor</Link>
              </Button>
              <Button variant="reverse" asChild size="lg" className="w-full">
                <Link href="/auth/signup?role=consultant">Become a Mentor</Link>
              </Button>
            </div>
          </motion.div>

          {/* Floating illustration */}
          <motion.div 
            className="mt-12 flex justify-center"
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          >
            <div className="relative w-64 h-64">
              <Image
                src="/images/hero-illustration.png"
                alt="College students"
                fill
                className="object-contain"
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Desktop Hero */}
      <div className="hidden md:block">
        <div className="container mx-auto px-4 py-24 flex items-center">
          <div className="grid grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-5xl font-bold mb-6">
                Connect with <span className="text-main">Elite</span> College Consultants
              </h1>
              <p className="text-xl mb-8 max-w-lg">
                Get personalized guidance from top-tier mentors who've been there, done that.
                Our consultants are current students at prestigious universities.
              </p>
              <div className="flex gap-4">
                <Button asChild size="lg">
                  <Link href="/mentors">Find a Mentor</Link>
                </Button>
                <Button variant="reverse" asChild size="lg">
                  <Link href="/auth/signup?role=consultant">Become a Mentor</Link>
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="relative"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <motion.div 
                animate={isHovered ? { y: -10 } : { y: 0 }}
                transition={{ duration: 0.3 }}
                className="relative w-full h-[400px]"
              >
                <Image
                  src="/images/hero-illustration.png"
                  alt="College students"
                  fill
                  className="object-contain"
                />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
