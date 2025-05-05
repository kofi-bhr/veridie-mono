'use client';

import { useState } from 'react';
import { Package } from '@/lib/payments/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PackageForm } from './PackageForm';
import { Edit2, Plus, Calendar } from 'lucide-react';

interface PackageListProps {
  packages: Package[];
  consultantId: string;
  onPackageUpdate?: () => void;
}

export function PackageList({
  packages,
  consultantId,
  onPackageUpdate,
}: PackageListProps) {
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSuccess = async () => {
    setIsDialogOpen(false);
    setSelectedPackage(null);
    onPackageUpdate?.();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Your Packages</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => setSelectedPackage(null)}
              className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Package
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {selectedPackage ? 'Edit Package' : 'Create New Package'}
              </DialogTitle>
            </DialogHeader>
            <PackageForm
              consultant_id={consultantId}
              initialData={selectedPackage ?? undefined}
              onSubmit={handleSuccess}
              onCancel={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <Card
            key={pkg.id}
            className={`p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
              !pkg.is_active ? 'opacity-60' : ''
            }`}
          >
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold">{pkg.title}</h3>
                <p className="text-gray-600 mt-1">{pkg.description}</p>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <p className="text-2xl font-bold">{formatPrice(pkg.price)}</p>
                  <p className="text-sm text-gray-500">
                    {/* Duration is not available in the Package type from @/lib/payments/types */}
                    {/* Using a default value instead */}
                    Consultation
                  </p>
                </div>

                <div className="flex gap-2">
                  {pkg.calendly_link ? (
                    <a
                      href={pkg.calendly_link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button
                        size="sm"
                        variant="neutral"
                        className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                      >
                        <Calendar className="h-4 w-4" />
                      </Button>
                    </a>
                  ) : null}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="neutral"
                        onClick={() => {
                          setSelectedPackage(pkg);
                          setIsDialogOpen(true);
                        }}
                        className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                </div>
              </div>

              {!pkg.is_active && (
                <div className="mt-2">
                  <span className="text-sm text-gray-500">
                    This package is currently inactive
                  </span>
                </div>
              )}
            </div>
          </Card>
        ))}

        {packages.length === 0 && (
          <div className="col-span-full">
            <Card className="p-8 border-2 border-dashed border-gray-300 text-center">
              <p className="text-gray-500 mb-4">
                You haven&apos;t created any packages yet
              </p>
              <Button
                onClick={() => setIsDialogOpen(true)}
                className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Package
              </Button>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
