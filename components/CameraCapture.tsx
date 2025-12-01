
import React, { useRef, useEffect, useState } from 'react';
import { Icon } from './Icon';

interface CameraCaptureProps {
  onImageCapture: (file: File) => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onImageCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  const handleFlipCamera = () => {
    setFacingMode(prev => (prev === 'user' ? 'environment' : 'user'));
  };

  useEffect(() => {
    // This effect handles the entire camera stream lifecycle
    if (isCameraOn) {
      let stream: MediaStream | null = null;

      const openCamera = async () => {
        try {
          setError(null);
          const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode } });
          stream = mediaStream; // Keep control for cleanup

          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
            // Explicit play is a safeguard as autoPlay can be unreliable
            videoRef.current.play().catch(err => {
              console.error("Error playing video:", err);
              setError("Não foi possível iniciar a reprodução da câmera.");
            });
          }
        } catch (err) {
          console.error("Error accessing camera:", err);
          if ((err as Error).name === 'OverconstrainedError' || (err as Error).name === 'NotFoundError') {
             setError("Câmera solicitada não encontrada. Tentando outra.");
             // Fallback logic
             if (facingMode === 'environment') {
               setFacingMode('user'); // If rear fails, try front
             } else {
               // If front also fails, it's a more serious issue
               setError("Nenhuma câmera encontrada. Verifique as permissões do seu navegador.");
               setIsCameraOn(false);
             }
          } else {
             setError("Não foi possível acessar a câmera. Verifique as permissões do seu navegador.");
             setIsCameraOn(false); // Turn off on error
          }
        }
      };
      
      openCamera();

      // Cleanup function
      return () => {
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
      };
    }
  }, [isCameraOn, facingMode]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current && videoRef.current.srcObject && videoRef.current.readyState >= 2) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        // Only mirror the final image if it's from the front camera
        // to match the mirrored preview.
        if (facingMode === 'user') {
          context.translate(video.videoWidth, 0);
          context.scale(-1, 1);
        }
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' });
            onImageCapture(file);
            setIsCameraOn(false); // Turn off camera after capture
          }
        }, 'image/jpeg', 0.95);
      }
    }
  };
  
  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-center gap-4 p-2">
        <canvas ref={canvasRef} className="hidden"></canvas>
        
        <div className="w-full flex-grow max-w-sm aspect-square bg-black rounded-lg overflow-hidden flex items-center justify-center my-2 relative">
            {error ? (
              <p className="text-red-400 p-4">{error}</p>
            ) : isCameraOn ? (
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="w-full h-full object-cover"
                style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
              ></video>
            ) : (
              <div className="flex flex-col items-center gap-2 text-gray-500">
                 <Icon name="camera" className="w-16 h-16" />
                 <p>Câmera desligada</p>
              </div>
            )}
        </div>
        
        <div className="flex items-center justify-center gap-4">
          {!isCameraOn ? (
            <button onClick={() => setIsCameraOn(true)} className="px-6 py-2 bg-emerald-600 text-white rounded-md font-medium hover:bg-emerald-500 transition-colors flex items-center gap-2">
              <Icon name="camera" className="w-5 h-5" /> Abrir Câmera
            </button>
          ) : (
            <>
              <button onClick={handleFlipCamera} className="p-3 bg-gray-700 text-white rounded-full font-medium hover:bg-gray-600 transition-colors flex items-center justify-center" title="Virar Câmera">
                <Icon name="refresh" className="w-5 h-5"/>
              </button>
              <button onClick={handleCapture} className="p-5 bg-emerald-600 text-white rounded-full font-medium hover:bg-emerald-500 transition-colors flex items-center justify-center text-lg shadow-lg" title="Capturar Foto">
                <Icon name="camera" className="w-6 h-6"/>
              </button>
              <button onClick={() => setIsCameraOn(false)} className="p-3 bg-gray-700 text-white rounded-full font-medium hover:bg-gray-600 transition-colors flex items-center justify-center" title="Desligar Câmera">
                <Icon name="close" className="w-5 h-5"/>
              </button>
            </>
          )}
        </div>
    </div>
  );
};
