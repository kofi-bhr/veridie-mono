import React from 'react';
import { Button } from '@/components/ui/neobrutalism';
import { Package } from '@/lib/payments/types';
import { formatCurrency } from '@/lib/utils';

interface PackageCardProps {
  package: Package;
  onSelect?: () => void;
  onEdit?: () => void;
  isEditable?: boolean;
  isSelected?: boolean;
}

export function PackageCard({ 
  package: pkg, 
  onSelect, 
  onEdit, 
  isEditable = false,
  isSelected = false 
}: PackageCardProps) {
  return (
    <div 
      className={`
        relative p-6 rounded-lg border-2 border-black shadow-brutal
        ${isSelected ? 'bg-primary-50' : 'bg-white'}
        ${!pkg.is_active ? 'opacity-60' : ''}
      `}
    >
      {!pkg.is_active && (
        <div className="absolute top-2 right-2 px-2 py-1 text-xs bg-yellow-100 border border-yellow-500 rounded">
          Inactive
        </div>
      )}
      
      <h3 className="text-xl font-bold mb-4">{pkg.title}</h3>
      
      <div className="text-2xl font-bold mb-6">
        {formatCurrency(pkg.price)}
      </div>

      <ul className="mb-6 space-y-2">
        {pkg.description.map((item: string, index: number) => (
          <li key={index} className="flex items-start">
            <span className="mr-2">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <div className="space-y-3">
        {isEditable ? (
          <Button 
            onClick={onEdit}
            variant="neutral"
            className="w-full"
          >
            Edit Package
          </Button>
        ) : (
          <Button 
            onClick={onSelect}
            variant="primary"
            className="w-full"
          >
            Select Package
          </Button>
        )}
      </div>
    </div>
  );
}
