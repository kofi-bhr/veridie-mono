'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

// Define a type for the consultant data
interface Consultant {
  id: number;
  slug: string;
  profiles: { first_name: string; last_name: string; }[];
  university: string;
  headline: string;
  image_url: string;
  accepted_schools: string[];
}

export default function AboutPage() {
  const [secondConsultant, setSecondConsultant] = useState<Consultant | null>(null);

  useEffect(() => {
    const fetchSecondConsultant = async () => {
      const { data, error } = await supabase
        .from('consultants')
        .select(`
          id,
          slug,
          profiles(first_name, last_name),
          university,
          headline,
          image_url,
          accepted_schools
        `)
        .order('id', { ascending: true })
        .limit(2);

      if (error) {
        console.error('Error fetching consultants:', error);
        return;
      }

      if (data && data.length > 1) {
        setSecondConsultant(data[1]);
      }
    };

    fetchSecondConsultant();
  }, []);

  return (
    <main className="min-h-screen bg-background pt-24 pb-16">
      <div className="container mx-auto px-6 md:px-8">
        {/* Hero Section */}
        <section className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Real Advice. Real Results.</h1>
            <p className="text-xl mb-8">
              We're not your parents' college consulting service. We're the real deal.
            </p>
          </motion.div>
        </section>

        {/* Our Story Section */}
        <section className="mb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <Card 
              className="h-full border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden transition-all hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-none"
              tabIndex={0}
              aria-label="Our Story"
            >
              <div className="pt-2 px-4 pb-0 flex flex-col h-full">
                <p className="py-0.5 px-4">
                  Veridie was born from a simple truth: the college admissions process is broken. Traditional consulting services charge astronomical fees for outdated advice from consultants who haven't navigated the current admissions landscape themselves. We flipped the script. Our platform connects you with consultants who just cracked the code—recent admits to top universities who know exactly what works right now, not what worked a decade ago.
                </p>
              </div>
            </Card>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              whileHover={{ y: -5 }}
            >
              <Card 
                className="h-full border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden transition-all hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-none"
                tabIndex={0}
                aria-label="View profile of Sebastian Tan, College Consultant"
              >
                <div className="pt-0 px-4 pb-0 flex flex-col h-full">
                  <div className="flex flex-row gap-4">
                    <div className="relative w-24 h-24 shrink-0 overflow-hidden border-2 border-black">
                      <Image
                        src="/images/sebastian-tan-new-photo.jpg" // Replace with actual path
                        alt="Sebastian Tan"
                        width={96}
                        height={96}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold">Sebastian Tan</h3>
                      <p className="text-foreground/80 text-sm">Founder @ Veridie</p>
                      <div className="mt-1 bg-[#ff8188] inline-block px-2 py-1 text-sm border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-bold">
                        Coca-Cola Scholar
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 mb-2">
                    <span className="text-xs text-foreground/60 block mb-1">Interests:</span>
                    <div className="flex gap-2 overflow-x-auto scrollbar-hide relative">
                      <div className="bg-white px-2 py-1 text-xs border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-bold whitespace-nowrap flex-shrink-0">
                        Computer Science
                      </div>
                      <div className="bg-white px-2 py-1 text-xs border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-bold whitespace-nowrap flex-shrink-0">
                        Mathematics
                      </div>
                    </div>
                  </div>
                  <div className="mt-auto">
                    <Button asChild className="w-full rounded-none">
                      <Link href="#" className="font-bold">View Profile</Link>
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Our Difference Section */}
        <section className="mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-center mb-12"
          >
            The Veridie Difference
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0 }}
              viewport={{ once: true }}
            >
              <Card className="p-6 h-full bg-[#FFEDDF] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:translate-y-[-4px] rounded-none">
                <h3 className="text-xl font-bold mb-4">Fresh Perspectives</h3>
                <p className="mb-4">
                  Our consultants aren't career advisors—they're successful students who just navigated 
                  the exact process you're facing. Their insights are current, relevant, and proven to work. 
                  They know what admissions officers are looking for because they just impressed those 
                  same officers with their own applications.
                </p>
              </Card>
            </motion.div>

            {/* Card 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="p-6 h-full bg-[#E5DEFF] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:translate-y-[-4px] rounded-none">
                <h3 className="text-xl font-bold mb-4">No BS Approach</h3>
                <p className="mb-4">
                  We cut through the noise and deliver straight talk. No corporate jargon, no vague promises—just 
                  clear, actionable advice from people who succeeded where most fail. Our consultants tell you what 
                  actually matters, not what the traditional consulting industry wants you to believe matters.
                </p>
              </Card>
            </motion.div>

            {/* Card 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Card className="p-6 h-full bg-[#DEFFEF] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:translate-y-[-4px] rounded-none">
                <h3 className="text-xl font-bold mb-4">Accessible Excellence</h3>
                <p className="mb-4">
                  Elite consulting shouldn't cost more than tuition. We've created a platform where top-tier 
                  advice is affordable and accessible to students from all backgrounds. Our consultants are motivated 
                  by a desire to give back and help others achieve the same success they've earned.
                </p>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Our Values Section */}
        <section className="mb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="order-2 md:order-1"
            >
              <div className="relative h-[400px] border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <Image
                  src="/images/about-values.jpg"
                  alt="Students working together"
                  fill
                  className="object-cover"
                />
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="order-1 md:order-2"
            >
              <h2 className="text-3xl font-bold mb-6">Our Values</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold mb-2">Authenticity</h3>
                  <p>
                    We believe in keeping it real. Our consultants share their genuine experiences—both 
                    successes and failures—to give you the complete picture of what it takes to succeed.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Results-Driven</h3>
                  <p>
                    Everything we do is focused on one outcome: getting you into your dream school. 
                    We measure our success by your acceptance letters.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Empowerment</h3>
                  <p>
                    We don't just do the work for you—we teach you how to present your authentic self 
                    in a way that resonates with admissions committees. The skills you learn with us 
                    will serve you throughout your academic and professional career.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Call to Action */}
        <section>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-3xl font-bold mb-6">Ready to Get Real About College Admissions?</h2>
            <p className="text-xl mb-8">
              Connect with consultants who've been in your shoes and succeeded where most don't.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                asChild 
                size="lg" 
                className="bg-main hover:bg-main/90 text-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                <Link href="/mentors">Find Your Mentor</Link>
              </Button>
              
              <Button 
                variant="reverse" 
                asChild 
                size="lg" 
                className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                <Link href="/auth/signup?role=consultant">Join As A Consultant</Link>
              </Button>
            </div>
          </motion.div>
        </section>
      </div>
    </main>
  );
}
