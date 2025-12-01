
import React, { useState } from 'react';

interface FilterButtonsProps {
  onApplyFilter: (filter: 'original' | 'sepia' | 'bw' | 'vibrant') => void;
}

export const FilterButtons: React.FC<FilterButtonsProps> = ({ onApplyFilter }) => {
  const [activeFilter, setActiveFilter] = useState<'original' | 'sepia' | 'bw' | 'vibrant'>('original');

  const handleFilterClick = (filter: 'original' | 'sepia' | 'bw' | 'vibrant') => {
    setActiveFilter(filter);
    onApplyFilter(filter);
  };
  
  const filters = [
    { id: 'original', name: 'Original' },
    { id: 'sepia', name: 'Sépia' },
    { id: 'bw', name: 'P&B' },
    { id: 'vibrant', name: 'Vibrante' },
  ] as const;


  return (
    <div className="p-2 bg-gray-700/50 rounded-lg">
        <div className="flex items-center justify-center gap-2">
        {filters.map(filter => (
             <button
                key={filter.id}
                onClick={() => handleFilterClick(filter.id)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeFilter === filter.id
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                }`}
            >
                {filter.name}
            </button>
        ))}
        </div>
    </div>
  );
};