'use client';

import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { GraduationCap, Award, Shield } from 'lucide-react';

const features = [
  {
    title: 'Expert Mentorship',
    description: "Connect with consultants who've gained admission to top universities and know what it takes to succeed.",
    icon: <GraduationCap className="w-8 h-8" />,
    color: 'bg-[#FFEDDF]'
  },
  {
    title: 'Personalized Guidance',
    description: 'Get tailored advice specific to your goals, background, and aspirations.',
    icon: <Award className="w-8 h-8" />,
    color: 'bg-[#E5DEFF]'
  },
  {
    title: 'Secure Platform',
    description: 'Enjoy peace of mind with our secure payment system and verified consultant profiles.',
    icon: <Shield className="w-8 h-8" />,
    color: 'bg-[#DEFFEF]'
  }
];

const Features = () => {
  return (
    <section className="py-12 md:py-20">
      <div className="container mx-auto px-4">
        <motion.h2 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold text-center mb-12"
        >
          Why Choose Veridie?
        </motion.h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className={`p-6 h-full ${feature.color} border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:translate-y-[-4px]`}>
                <div className="flex flex-col h-full">
                  <div className="mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-foreground/80">{feature.description}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
