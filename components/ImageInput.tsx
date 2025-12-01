
import React, { useState } from 'react';
import { ImageUploader } from './ImageUploader';
import { CameraCapture } from './CameraCapture';
import { Icon } from './Icon';

interface ImageInputProps {
  onImageUpload: (file: File | null) => void;
}

export const ImageInput: React.FC<ImageInputProps> = ({ onImageUpload }) => {
  const [activeMode, setActiveMode] = useState<'upload' | 'camera'>('upload');
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleImageSelect = (file: File) => {
    setImageFile(file);
    onImageUpload(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    onImageUpload(null);
  };

  if (imageFile) {
    return (
      <div className="relative w-full h-full group bg-black rounded-lg">
        <img
          src={URL.createObjectURL(imageFile)}
          alt="Preview"
          className="w-full h-full object-contain rounded-lg"
        />
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
          <button
            onClick={handleRemoveImage}
            className="px-4 py-2 bg-red-600 text-white rounded-md font-medium hover:bg-red-500 transition-colors flex items-center gap-2"
          >
            <Icon name="trash" className="w-5 h-5" />
            Remover
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-gray-900/30 rounded-lg overflow-hidden">
      <div className="flex-shrink-0 flex p-1 bg-gray-700/50">
        <button
          onClick={() => setActiveMode('upload')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
            activeMode === 'upload' ? 'bg-emerald-600 text-white' : 'text-gray-300 hover:bg-gray-600'
          }`}
        >
          <Icon name="upload" className="w-5 h-5" />
          Enviar Arquivo
        </button>
        <button
          onClick={() => setActiveMode('camera')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
            activeMode === 'camera' ? 'bg-emerald-600 text-white' : 'text-gray-300 hover:bg-gray-600'
          }`}
        >
          <Icon name="camera" className="w-5 h-5" />
          Usar Câmera
        </button>
      </div>
      <div className="flex-grow">
        {activeMode === 'upload' ? (
          <ImageUploader onImageUpload={handleImageSelect} />
        ) : (
          <CameraCapture onImageCapture={handleImageSelect} />
        )}
      </div>
    </div>
  );
};
