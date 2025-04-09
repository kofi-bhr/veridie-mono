'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

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

  const handleBuy = (packageId: string) => {
    // This will be implemented with Stripe integration
    console.log(`Buy package: ${packageId}`);
    // Will redirect to checkout page or open modal
  };

  if (packages.length === 0) {
    return (
      <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
        <h3 className="text-xl font-bold mb-2">No Packages Available</h3>
        <p className="text-foreground/80">
          This consultant hasn't created any service packages yet.
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
                >
                  Buy Now
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
                  >
                    Buy Now
                  </Button>
                </div>
              </Card>
            </div>
          ))}

          {/* Carousel navigation */}
          <div className="flex justify-between mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="border-2 border-black"
            >
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {packages.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentIndex ? 'bg-main' : 'bg-gray-300'
                  }`}
                  onClick={() => {
                    setCurrentIndex(index);
                    setActivePackage(packages[index].id);
                  }}
                />
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              disabled={currentIndex === packages.length - 1}
              className="border-2 border-black"
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
