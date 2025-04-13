'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

const testimonials = [
  {
    name: "Alex Johnson",
    role: "Accepted to Stanford",
    content: "My mentor helped me craft the perfect application strategy. Their insights as a current student were invaluable!",
    avatar: "/images/testimonial-1.jpg",
    initials: "AJ"
  },
  {
    name: "Maya Patel",
    role: "Accepted to MIT",
    content: "Working with my consultant completely transformed my essays. They knew exactly what admissions officers were looking for.",
    avatar: "/images/testimonial-2.jpg",
    initials: "MP"
  },
  {
    name: "David Kim",
    role: "Accepted to Harvard",
    content: "The personalized guidance I received was game-changing. My mentor helped me highlight strengths I didn't even know I had.",
    avatar: "/images/testimonial-3.jpg",
    initials: "DK"
  }
];

const Testimonials = () => {
  return (
    <section className="py-12 md:py-20 bg-[var(--background)]">
      <div className="container mx-auto px-4">
        <motion.h2 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold text-center mb-12"
        >
          Success Stories
        </motion.h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="p-6 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:translate-y-[-4px]">
                <div className="flex flex-col h-full">
                  <div className="flex items-center mb-4">
                    <Avatar className="h-10 w-10 mr-3 border-2 border-black">
                      <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                      <AvatarFallback>{testimonial.initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-bold">{testimonial.name}</p>
                      <p className="text-sm text-foreground/70">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-foreground/80 italic">{testimonial.content}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
