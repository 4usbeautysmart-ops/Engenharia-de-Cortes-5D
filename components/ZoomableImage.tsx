
import React, { useState, useRef, MouseEvent, WheelEvent } from 'react';
import { Icon } from './Icon';

interface ZoomableImageProps {
  src: string;
  alt: string;
}

const MAX_SCALE = 5;
const MIN_SCALE = 0.5;
const ZOOM_SENSITIVITY = 0.001;

export const ZoomableImage: React.FC<ZoomableImageProps> = ({ src, alt }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const isPanning = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });

  const handleWheel = (e: WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale - e.deltaY * ZOOM_SENSITIVITY));
    setScale(newScale);
  };

  const handleMouseDown = (e: MouseEvent<HTMLImageElement>) => {
    if (scale <= 1) return;
    e.preventDefault();
    isPanning.current = true;
    startPos.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    e.currentTarget.style.cursor = 'grabbing';
  };

  const handleMouseMove = (e: MouseEvent<HTMLImageElement>) => {
    if (!isPanning.current) return;
    e.preventDefault();
    setPosition({
      x: e.clientX - startPos.current.x,
      y: e.clientY - startPos.current.y,
    });
  };

  const handleMouseUpOrLeave = (e: MouseEvent<HTMLImageElement>) => {
    if (isPanning.current) {
        e.preventDefault();
        isPanning.current = false;
        e.currentTarget.style.cursor = 'grab';
    }
  };
  
  const adjustScale = (newScale: number) => {
      setScale(Math.max(MIN_SCALE, Math.min(MAX_SCALE, newScale)));
  }

  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // --- Watermark Logic ---

  const applyWatermark = async (originalSrc: string): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = originalSrc;
        
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error("Canvas context not available"));
                return;
            }

            // Set canvas dimensions to match image
            canvas.width = img.width;
            canvas.height = img.height;

            // Draw original image
            ctx.drawImage(img, 0, 0);

            // Watermark Settings
            const logoSize = Math.max(img.width * 0.12, 100); // 12% of width or min 100px
            const padding = logoSize * 0.2;
            const x = canvas.width - logoSize - padding;
            const y = canvas.height - logoSize - padding;

            // Draw Logo (Using the SVG path from Logo.tsx converted to Data URI)
            const logoSvgString = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${logoSize}" height="${logoSize}">
                <defs>
                    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#34d399;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#15803d;stop-opacity:1" />
                    </linearGradient>
                    <filter id="shadow">
                        <feDropShadow dx="1" dy="1" stdDeviation="1" flood-color="black" flood-opacity="0.5"/>
                    </filter>
                </defs>
                <g filter="url(#shadow)">
                    <g transform="translate(0, 5) skewY(-10) scale(1, 1.1)">
                        <path d="M50 15 L75 2.5 L75 52.5 L50 65 Z" fill="#14532d" />
                        <path d="M50 15 L25 2.5 L50 -10 L75 2.5 Z" fill="#6ee7b7" />
                        <path d="M50 15 L25 2.5 L25 52.5 L50 65 Z" fill="url(#grad)" />
                    </g>
                    <g transform="translate(10, 10)" fill="none" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="45" cy="30" r="10" />
                        <circle cx="45" cy="60" r="10" />
                        <line x1="45" y1="40" x2="20" y2="15" />
                        <line x1="45" y1="50" x2="20" y2="75" />
                    </g>
                </g>
            </svg>`;

            const logoImg = new Image();
            logoImg.src = 'data:image/svg+xml;base64,' + btoa(logoSvgString);
            
            logoImg.onload = () => {
                // Add Drop Shadow for text readability
                ctx.shadowColor = "rgba(0, 0, 0, 0.7)";
                ctx.shadowBlur = 4;
                ctx.shadowOffsetX = 2;
                ctx.shadowOffsetY = 2;

                // Draw Text
                const fontSize = logoSize * 0.35;
                ctx.font = `bold ${fontSize}px sans-serif`;
                ctx.fillStyle = "#ffffff";
                ctx.textAlign = "right";
                ctx.textBaseline = "middle";
                
                // Draw text to the left of the logo
                ctx.fillText("Engenharia de Cortes 5D", x - 10, y + (logoSize / 2));
                
                // Reset shadow for logo drawing (SVG has its own shadow filter in defs, but canvas drawImage respects context shadow too)
                ctx.shadowColor = "transparent";
                
                // Draw Logo Image
                ctx.drawImage(logoImg, x, y, logoSize, logoSize);

                // Export
                canvas.toBlob((blob) => {
                    if (blob) resolve(blob);
                    else reject(new Error("Conversion failed"));
                }, 'image/png');
            };
            
            logoImg.onerror = (e) => reject(e);
        };
        img.onerror = (e) => reject(e);
    });
  };

  // --- Save/Share Handlers ---

  const showFeedback = (msg: string) => {
      setFeedbackMessage(msg);
      setTimeout(() => setFeedbackMessage(null), 2000);
  };

  const handleDownload = async (e: React.MouseEvent) => {
      e.stopPropagation();
      setFeedbackMessage("Processando...");
      try {
        const blob = await applyWatermark(src);
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `engenharia-cortes-5d-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        showFeedback("Imagem salva com marca d'água!");
      } catch (err) {
        console.error(err);
        showFeedback("Erro ao processar imagem.");
      }
  };

  const handleShare = async (e: React.MouseEvent) => {
      e.stopPropagation();
      setFeedbackMessage("Preparando...");
      try {
          const blob = await applyWatermark(src);
          const file = new File([blob], "engenharia-cortes-5d-resultado.png", { type: 'image/png' });

          if (navigator.share && navigator.canShare({ files: [file] })) {
              await navigator.share({
                  files: [file],
                  title: 'Engenharia de Cortes 5D',
                  text: 'Confira este resultado incrível gerado pela IA da Engenharia de Cortes 5D!'
              });
              setFeedbackMessage(null);
          } else {
              // Fallback: Copy to clipboard
              try {
                  await navigator.clipboard.write([
                      new ClipboardItem({ [blob.type]: blob })
                  ]);
                  showFeedback("Copiado para área de transferência!");
              } catch (clipErr) {
                  showFeedback("Não foi possível compartilhar.");
                  console.error(clipErr);
              }
          }
      } catch (error) {
          console.error("Share failed:", error);
          showFeedback("Erro ao compartilhar.");
      }
  };

  return (
    <div 
        className="relative w-full h-80 bg-gray-700 rounded-lg overflow-hidden group select-none"
        onWheel={handleWheel}
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-contain transition-transform duration-100 ease-out"
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          transformOrigin: 'center center',
          cursor: scale > 1 ? 'grab' : 'default',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        draggable="false"
      />
      
      {/* Top Right Action Buttons (Save/Share) */}
      <div className="absolute top-2 right-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button 
            onClick={handleShare} 
            className="p-2 bg-gray-900/70 text-white rounded-full hover:bg-emerald-600 transition-colors backdrop-blur-sm shadow-lg" 
            title="Compartilhar com Marca D'água"
        >
            <Icon name="share" className="w-5 h-5"/>
        </button>
        <button 
            onClick={handleDownload} 
            className="p-2 bg-gray-900/70 text-white rounded-full hover:bg-emerald-600 transition-colors backdrop-blur-sm shadow-lg" 
            title="Baixar com Marca D'água"
        >
            <Icon name="download" className="w-5 h-5"/>
        </button>
      </div>

      {/* Bottom Right Zoom Controls */}
      <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-gray-900/50 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button onClick={() => adjustScale(scale * 1.25)} className="p-1.5 text-white hover:bg-gray-700/80 rounded-md" title="Aumentar zoom"><Icon name="zoom-in" className="w-5 h-5"/></button>
        <button onClick={() => adjustScale(scale / 1.25)} className="p-1.5 text-white hover:bg-gray-700/80 rounded-md" title="Diminuir zoom"><Icon name="zoom-out" className="w-5 h-5"/></button>
        <button onClick={handleReset} className="p-1.5 text-white hover:bg-gray-700/80 rounded-md" title="Resetar zoom"><Icon name="zoom-reset" className="w-5 h-5"/></button>
      </div>

      {/* Feedback Toast */}
      {feedbackMessage && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/80 text-white px-4 py-2 rounded-lg text-sm font-medium animate-fadeInOut pointer-events-none z-20">
              {feedbackMessage}
          </div>
      )}
    </div>
  );
};
