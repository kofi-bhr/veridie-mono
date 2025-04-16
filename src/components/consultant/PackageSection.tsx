'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { toast } from 'sonner';
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

type Package = {
  id: string;
  title: string;
  description: string;
  price: number;
  features: string[];
};

type PackageSectionProps = {
  packages: Package[];
};

const PackageSection = ({ packages }: PackageSectionProps) => {
  const [activePackage, setActivePackage] = useState<string | null>(
    packages.length > 0 ? packages[0].id : null
  );
  const [isLoading, setIsLoading] = useState(false);

  // For mobile carousel
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    if (currentIndex < packages.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setActivePackage(packages[currentIndex + 1].id);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setActivePackage(packages[currentIndex - 1].id);
    }
  };

  const handleBuy = async (packageId: string) => {
    try {
      setIsLoading(true);
      
      // Create checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ packageId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create checkout session');
      }

      const { sessionId } = await response.json();
      
      // Redirect to Stripe Checkout
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe failed to initialize');
      }

      const { error } = await stripe.redirectToCheckout({ sessionId });
      
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to start checkout process. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (packages.length === 0) {
    return (
      <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
        <h3 className="text-xl font-bold mb-2">No Packages Available</h3>
        <p className="text-foreground/80">
          This consultant hasn&apos;t created any service packages yet.
        </p>
      </div>
    );
  }

  // Format price as currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Services & Packages</h2>

      {/* Desktop view: Cards in a grid */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <motion.div
            key={pkg.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            whileHover={{ y: -5 }}
          >
            <Card className="h-full border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden transition-all hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <div className="p-6 flex flex-col h-full">
                <div className="mb-4">
                  <h3 className="text-xl font-bold">{pkg.title}</h3>
                  <div className="text-2xl font-bold text-main mt-1">
                    {formatPrice(pkg.price)}
                  </div>
                </div>

                <p className="text-sm text-foreground/80 mb-4">{pkg.description}</p>

                <div className="mb-6 flex-grow">
                  <h4 className="text-sm font-medium mb-2">What's included:</h4>
                  <ul className="space-y-2">
                    {pkg.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-main flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button 
                  onClick={() => handleBuy(pkg.id)}
                  className="w-full mt-auto"
                  disabled={isLoading}
                >
                  {isLoading ? 'Processing...' : 'Buy Now'}
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Mobile view: Carousel */}
      <div className="md:hidden">
        <div className="relative">
          {packages.map((pkg, index) => (
            <div
              key={pkg.id}
              className={`transition-opacity duration-300 ${
                index === currentIndex ? 'opacity-100' : 'opacity-0 hidden'
              }`}
            >
              <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold">{pkg.title}</h3>
                    <div className="text-2xl font-bold text-main mt-1">
                      {formatPrice(pkg.price)}
                    </div>
                  </div>

                  <p className="text-sm text-foreground/80 mb-4">{pkg.description}</p>

                  <div className="mb-6">
                    <h4 className="text-sm font-medium mb-2">What's included:</h4>
                    <ul className="space-y-2">
                      {pkg.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <Check className="h-4 w-4 text-main flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button 
                    onClick={() => handleBuy(pkg.id)}
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Processing...' : 'Buy Now'}
                  </Button>
                </div>
              </Card>
            </div>
          ))}

          {/* Carousel navigation */}
          <div className="flex justify-between mt-4">
            <Button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              variant="outline"
            >
              Previous
            </Button>
            <Button
              onClick={handleNext}
              disabled={currentIndex === packages.length - 1}
              variant="outline"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackageSection;
