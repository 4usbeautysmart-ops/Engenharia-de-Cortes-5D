
import React, { useCallback, useState } from 'react';
import { Icon } from './Icon';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageUpload(e.target.files[0]);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onImageUpload(e.dataTransfer.files[0]);
    }
  }, [onImageUpload]);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };


  return (
    <div
      className={`relative w-full h-full flex items-center justify-center text-center rounded-xl transition-all duration-300 ${isDragging ? 'bg-emerald-500/20' : ''}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <input
        type="file"
        id="image-upload"
        className="hidden"
        accept="image/png, image/jpeg, image/webp"
        onChange={handleFileChange}
      />
      <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center justify-center gap-4 h-full p-4">
        <Icon name="upload" className="w-12 h-12 text-gray-500" />
        <h2 className="text-lg font-semibold text-gray-300">Enviar Arquivo</h2>
        <p className="text-sm text-gray-400">Arraste uma foto ou clique para selecionar.</p>
        <div className="mt-2 px-6 py-2 bg-emerald-600 text-white rounded-md font-medium hover:bg-emerald-500 transition-colors">
          Selecionar
        </div>
      </label>
    </div>
  );
};
