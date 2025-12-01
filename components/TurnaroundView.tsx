
import React, { useState } from 'react';
import { ZoomableImage } from './ZoomableImage';

interface TurnaroundViewProps {
  frontImage: string;
  sideImage: string;
  backImage: string;
}

export const TurnaroundView: React.FC<TurnaroundViewProps> = ({ frontImage, sideImage, backImage }) => {
  const [activeView, setActiveView] = useState<'front' | 'side' | 'back'>('front');

  const images = {
    front: frontImage,
    side: sideImage,
    back: backImage
  };

  return (
    <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700">
      <div className="flex justify-center gap-4 mb-4">
        <button
          onClick={() => setActiveView('front')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${activeView === 'front' ? 'bg-emerald-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
        >
          Frente
        </button>
        <button
          onClick={() => setActiveView('side')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${activeView === 'side' ? 'bg-emerald-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
        >
          Lado
        </button>
        <button
          onClick={() => setActiveView('back')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${activeView === 'back' ? 'bg-emerald-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
        >
          Costas
        </button>
      </div>
      
      <div className="relative aspect-square w-full max-w-md mx-auto">
         <div className="w-full h-full">
            <ZoomableImage key={activeView} src={images[activeView]} alt={`Visualização ${activeView}`} />
         </div>
      </div>
      <p className="text-center text-xs text-gray-400 mt-2">
          {activeView === 'front' ? 'Vista Frontal' : activeView === 'side' ? 'Vista Lateral' : 'Vista Posterior'}
      </p>
    </div>
  );
};
