import React from 'react';
import { PackageCard } from './PackageCard';
import { Package } from '@/lib/payments/types';

interface PackageGridProps {
  packages: Package[];
  onSelectPackage?: (pkg: Package) => void;
  onEditPackage?: (pkg: Package) => void;
  selectedPackageId?: string;
  isEditable?: boolean;
}

export function PackageGrid({
  packages,
  onSelectPackage,
  onEditPackage,
  selectedPackageId,
  isEditable = false,
}: PackageGridProps) {
  if (!packages.length) {
    return (
      <div className="text-center py-12 border-2 border-dashed rounded-lg">
        <p className="text-gray-500">No packages available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {packages.map((pkg) => (
        <PackageCard
          key={pkg.id}
          package={pkg}
          onSelect={() => onSelectPackage?.(pkg)}
          onEdit={() => onEditPackage?.(pkg)}
          isEditable={isEditable}
          isSelected={pkg.id === selectedPackageId}
        />
      ))}
    </div>
  );
}
