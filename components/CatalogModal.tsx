import React, { useState } from 'react';
import { catalogData, CatalogStyle } from '../utils/catalogData';
import { Icon } from './Icon';

interface CatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImageSelect: (url: string, name: string) => void;
}

const categories = Object.keys(catalogData);

export const CatalogModal: React.FC<CatalogModalProps> = ({ isOpen, onClose, onImageSelect }) => {
  const [activeCategory, setActiveCategory] = useState(categories[0]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-6xl max-h-[90vh] flex flex-col shadow-2xl shadow-emerald-500/10" onClick={(e) => e.stopPropagation()}>
        <div className="flex-shrink-0 flex justify-between items-center pb-4 mb-4 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-green-400">
            Catálogo de Inspiração
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-700">
            <Icon name="close" className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <div className="flex-shrink-0 mb-4">
          <div className="flex space-x-2 border-b border-gray-700 pb-2 overflow-x-auto">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`flex-shrink-0 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeCategory === category ? 'bg-emerald-600 text-white' : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-grow overflow-y-auto pr-2">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {catalogData[activeCategory].map((style: CatalogStyle) => (
              <div
                key={style.id}
                className="group relative cursor-pointer aspect-square rounded-lg overflow-hidden"
                onClick={() => onImageSelect(style.url, style.name)}
              >
                <img src={style.url} alt={style.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4 text-center">
                  <Icon name="scissors" className="w-10 h-10 text-white" />
                  <h3 className="font-semibold text-white mt-2">{style.name}</h3>
                  <p className="text-sm text-emerald-300">Analisar este corte</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};