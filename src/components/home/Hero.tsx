'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { motion, Variants } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

const Hero = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isChanging, setIsChanging] = useState(false);
  
  const highlightWords: string[] = ['Elite', 'Admitted', 'Successful', 'Recent', 'Cracked'];
  
  useEffect(() => {
    const interval = setInterval(() => {
      setIsChanging(true);
      setTimeout(() => {
        setCurrentWordIndex((prev) => (prev + 1) % highlightWords.length);
        setIsChanging(false);
      }, 500);
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Text animation variants
  const container: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03,
        delayChildren: 0.2
      }
    }
  };
  
  const child: Variants = {
    hidden: { opacity: 0, y: 20, filter: "blur(10px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { type: "spring", damping: 12, stiffness: 100 }
    }
  };
  
  // Faster text animation for paragraph
  const fastContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.01,
        delayChildren: 0.3
      }
    }
  };
  
  const fastChild: Variants = {
    hidden: { opacity: 0, y: 10, filter: "blur(5px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { type: "spring", damping: 20, stiffness: 200 }
    }
  };

  // Split text into characters for animation
  const splitText = (text: string) => {
    return text.split('').map((char: string, index: number) => (
      <motion.span key={index} variants={child}>
        {char}
      </motion.span>
    ));
  };
  
  // Split text with faster animation
  const splitTextFast = (text: string) => {
    return text.split('').map((char: string, index: number) => (
      <motion.span key={index} variants={fastChild}>
        {char}
      </motion.span>
    ));
  };
  
  // Split highlighted word for letter-by-letter animation
  const splitHighlightWord = (word: string) => {
    return (
      <motion.span 
        className="text-main"
        initial="hidden"
        animate="visible"
        variants={container}
      >
        {word.split('').map((char: string, index: number) => (
          <motion.span key={index} variants={child}>
            {char}
          </motion.span>
        ))}
      </motion.span>
    );
  };

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
            <div className="mb-4">
              <motion.h1 
                className="text-4xl font-bold"
                variants={container}
                initial="hidden"
                animate="visible"
              >
                <div className="whitespace-nowrap">
                  {splitText("Connect with ")}
                  {isChanging ? (
                    <span className="text-main blur-sm opacity-0 transition-all duration-300">
                      {highlightWords[currentWordIndex]}
                    </span>
                  ) : (
                    splitHighlightWord(highlightWords[currentWordIndex])
                  )}
                </div>
                <div>
                  {splitText("College Consultants")}
                </div>
              </motion.h1>
            </div>
            
            <motion.p 
              className="text-lg mb-8"
              variants={fastContainer}
              initial="hidden"
              animate="visible"
            >
              {splitTextFast("Get personalized guidance from top-tier mentors who've been there, done that.")}
            </motion.p>
            
            <div className="flex flex-col gap-4">
              <Button 
                asChild 
                size="lg" 
                className="w-full bg-main hover:bg-main/90 text-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                <Link href="/mentors">Find a Mentor</Link>
              </Button>
              
              <Button 
                variant="outline" 
                asChild 
                size="lg" 
                className="w-full border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
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
            <div className="relative w-full max-w-xs">
              <Image
                src="/images/hero-illustration.png"
                alt="Illustration, Veridie"
                width={300}
                height={300}
                className="object-contain"
                priority
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
              <div className="mb-6">
                <motion.h1 
                  className="text-5xl font-bold"
                  variants={container}
                  initial="hidden"
                  animate="visible"
                >
                  <div className="whitespace-nowrap">
                    {splitText("Connect with ")}
                    {isChanging ? (
                      <span className="text-main blur-sm opacity-0 transition-all duration-300">
                        {highlightWords[currentWordIndex]}
                      </span>
                    ) : (
                      splitHighlightWord(highlightWords[currentWordIndex])
                    )}
                  </div>
                  <div>
                    {splitText("College Consultants")}
                  </div>
                </motion.h1>
              </div>
              
              <motion.p 
                className="text-xl mb-8 max-w-lg"
                variants={fastContainer}
                initial="hidden"
                animate="visible"
              >
                {splitTextFast("Get personalized guidance from top-tier mentors who've been there, done that. Our consultants are current students at prestigious universities.")}
              </motion.p>
              
              <div className="flex gap-4">
                <Button 
                  asChild 
                  size="lg" 
                  className="bg-main hover:bg-main/90 text-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                  <Link href="/mentors">Find a Mentor</Link>
                </Button>
                
                <Button 
                  variant="outline" 
                  asChild 
                  size="lg" 
                  className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                >
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
                className="relative w-full"
              >
                <Image
                  src="/images/hero-illustration.png"
                  alt="Illustration, Veridie"
                  width={500}
                  height={500}
                  className="object-contain"
                  priority
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
