
import React, { useState } from 'react';
import type { Visagism360Report } from '../types';
import { Icon } from './Icon';
import { ZoomableImage } from './ZoomableImage';
import { generateVisagism360Pdf } from '../utils/pdfGenerator';

interface Visagism360DisplayProps {
  report: Visagism360Report;
  clientImage: string;
  onReset: () => void;
  setIsLoading: (loading: boolean) => void;
  setShareMessage: (msg: string | null) => void;
}

const StyleCard: React.FC<{ style: Visagism360Report['styles'][0]; index: number }> = ({ style, index }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'technical' | 'styling'>('overview');

    return (
        <div className="bg-gray-800/80 rounded-xl border border-purple-500/30 overflow-hidden hover:border-purple-500/60 transition-colors shadow-lg shadow-purple-900/10">
            {/* Header do Card */}
            <div className="p-4 bg-gradient-to-r from-gray-800 to-gray-700/50 flex items-center gap-3 border-b border-gray-700">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-600 text-white font-bold text-sm shadow-md">
                    {index + 1}
                </div>
                <h4 className="text-lg font-bold text-white flex-grow">{style.name}</h4>
            </div>

            {/* Abas de Navegação */}
            <div className="flex border-b border-gray-700">
                <button 
                    onClick={() => setActiveTab('overview')}
                    className={`flex-1 py-2 text-xs font-medium uppercase tracking-wider transition-colors ${activeTab === 'overview' ? 'bg-purple-500/10 text-purple-300 border-b-2 border-purple-500' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'}`}
                >
                    Visão Geral
                </button>
                <button 
                    onClick={() => setActiveTab('technical')}
                    className={`flex-1 py-2 text-xs font-medium uppercase tracking-wider transition-colors ${activeTab === 'technical' ? 'bg-emerald-500/10 text-emerald-300 border-b-2 border-emerald-500' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'}`}
                >
                    Técnico
                </button>
                <button 
                    onClick={() => setActiveTab('styling')}
                    className={`flex-1 py-2 text-xs font-medium uppercase tracking-wider transition-colors ${activeTab === 'styling' ? 'bg-pink-500/10 text-pink-300 border-b-2 border-pink-500' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'}`}
                >
                    Finalização
                </button>
            </div>

            {/* Conteúdo do Card */}
            <div className="p-4 min-h-[180px]">
                {activeTab === 'overview' && (
                    <div className="space-y-3 animate-fade-in">
                        <p className="text-gray-300 text-sm leading-relaxed">{style.description}</p>
                        <div className="bg-purple-900/20 p-3 rounded-lg border border-purple-500/20 mt-2">
                            <div className="flex items-center gap-2 mb-1">
                                <Icon name="check" className="w-4 h-4 text-purple-400" />
                                <span className="text-xs font-bold text-purple-300 uppercase">Por que funciona?</span>
                            </div>
                            <p className="text-xs text-gray-400 italic">{style.reason}</p>
                        </div>
                    </div>
                )}

                {activeTab === 'technical' && (
                    <div className="space-y-3 animate-fade-in">
                         <div className="flex items-start gap-3">
                            <Icon name="scissors" className="w-5 h-5 text-emerald-400 mt-1" />
                            <div>
                                <h5 className="text-sm font-semibold text-emerald-300 mb-1">Detalhes Técnicos</h5>
                                <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">{style.technicalDetails}</p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'styling' && (
                    <div className="space-y-3 animate-fade-in">
                        <div className="flex items-start gap-3">
                            <Icon name="magic" className="w-5 h-5 text-pink-400 mt-1" />
                            <div>
                                <h5 className="text-sm font-semibold text-pink-300 mb-1">Dicas de Finalização</h5>
                                <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">{style.stylingTips}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export const Visagism360Display: React.FC<Visagism360DisplayProps> = ({ 
  report, 
  clientImage, 
  onReset,
  setIsLoading,
  setShareMessage 
}) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const handleCopyColor = (color: string) => {
      navigator.clipboard.writeText(color);
      setCopiedColor(color);
      setTimeout(() => setCopiedColor(null), 2000);
  };
  
  const handleShareOrDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    setIsLoading(true);
    setShareMessage(null);
    try {
      const pdfBlob = await generateVisagism360Pdf(report, clientImage);
      const pdfFile = new File([pdfBlob], 'visagismo-360.pdf', { type: 'application/pdf' });
      
      if (navigator.share && navigator.canShare({ files: [pdfFile] })) {
        await navigator.share({
          title: 'Relatório Visagismo 360°',
          text: `Confira a análise de visagismo 360° para ${report.faceShape}.`,
          files: [pdfFile],
        });
      } else {
        // Fallback to download
        const link = document.createElement('a');
        link.href = URL.createObjectURL(pdfBlob);
        link.download = 'visagismo-360.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
        setShareMessage("PDF baixado com sucesso!");
      }
    } catch (err) {
       console.error("PDF generation/sharing failed:", err);
       if ((err as Error).name !== 'AbortError') {
         setShareMessage('Ocorreu um erro ao gerar ou compartilhar o PDF.');
       }
    } finally {
      setIsGeneratingPdf(false);
      setIsLoading(false);
      setTimeout(() => setShareMessage(null), 4000);
    }
  };

  return (
    <div className="bg-gray-800 rounded-2xl p-6 h-full flex flex-col">
       <div className="flex-shrink-0 flex justify-between items-center pb-4 mb-4 border-b border-gray-700 gap-4">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
          Visagismo 360°
        </h2>
        <div className="flex items-center gap-2">
           <button 
             id="visagism-export-btn"
             onClick={handleShareOrDownloadPdf} 
             disabled={isGeneratingPdf}
             className={`flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold transition-colors text-sm ${isGeneratingPdf ? 'opacity-50 cursor-not-allowed' : 'hover:bg-purple-500'}`}
           >
             {isGeneratingPdf ? (
                 <>
                   <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                   Gerando PDF...
                 </>
             ) : (
                 <>
                    <Icon name="share" className="w-5 h-5" />
                    Compartilhar / Baixar PDF
                 </>
             )}
          </button>
          <button onClick={onReset} className="px-4 py-2 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors text-sm">
            Nova Análise
          </button>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto pr-2 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Image and Face Analysis */}
        <div className="space-y-6">
            <div className="text-center">
                <h3 className="font-semibold mb-2">Foto da Cliente</h3>
                <ZoomableImage src={clientImage} alt="Cliente" />
            </div>

            <div id="visagism-face-analysis" className="bg-gray-900/50 p-6 rounded-xl space-y-4">
                 <h3 className="text-xl font-semibold text-purple-300 border-b border-gray-700 pb-2 mb-3">Análise Facial</h3>
                 <div className="flex items-start gap-4">
                     <div className="bg-purple-900/30 p-3 rounded-full">
                         <Icon name="face" className="w-8 h-8 text-purple-300"/>
                     </div>
                     <div>
                         <p className="text-sm text-gray-400">Formato Identificado</p>
                         <p className="text-lg font-bold text-white mb-2">{report.faceShape}</p>
                         
                         <p className="text-sm text-purple-200 mt-3 font-semibold">Impressão Psicológica:</p>
                         <p className="text-gray-300 text-sm leading-relaxed">{report.analysis}</p>

                         <p className="text-sm text-purple-200 mt-3 font-semibold">Características Físicas:</p>
                         <p className="text-gray-300 text-sm leading-relaxed">{report.physicalFeatures}</p>
                     </div>
                 </div>
            </div>
        </div>

        {/* Right Column: Colorimetry and Styles */}
        <div className="space-y-6">
             {/* Colorimetry Section */}
             <div id="visagism-colorimetry" className="bg-gray-900/50 p-6 rounded-xl space-y-4">
                 <h3 className="text-xl font-semibold text-pink-300 border-b border-gray-700 pb-2 mb-3">Colorimetria Pessoal</h3>
                 <div className="flex items-center justify-between mb-2">
                     <span className="text-gray-300 font-medium">Cartela Estimada:</span>
                     <span className="text-lg font-bold text-white px-3 py-1 bg-gradient-to-r from-pink-900/50 to-purple-900/50 rounded-lg border border-pink-500/30 shadow-sm">{report.colorimetry.season}</span>
                 </div>
                 <p className="text-gray-400 text-sm mb-4">{report.colorimetry.characteristics}</p>
                 
                 <div className="flex flex-col gap-3">
                     <span className="text-sm text-gray-300 font-semibold">Paleta Sugerida (Clique para copiar):</span>
                     <div className="flex flex-wrap gap-4 justify-center py-4 bg-gray-800 rounded-xl border border-gray-700 shadow-inner">
                        {report.colorimetry.bestColors.map((color, idx) => (
                            <button 
                                key={idx} 
                                onClick={() => handleCopyColor(color)}
                                className="group relative flex flex-col items-center gap-2 focus:outline-none"
                            >
                                <div 
                                    className="w-14 h-14 rounded-full border-4 border-gray-700 shadow-lg transition-transform duration-200 group-hover:scale-110 group-hover:border-white ring-2 ring-transparent group-hover:ring-pink-400" 
                                    style={{ backgroundColor: color }}
                                ></div>
                                <span className={`text-[10px] font-mono transition-colors ${copiedColor === color ? 'text-green-400 font-bold' : 'text-gray-500 group-hover:text-white'}`}>
                                    {copiedColor === color ? 'Copiado!' : color}
                                </span>
                            </button>
                        ))}
                     </div>
                 </div>
             </div>

             {/* Recommended Styles Section */}
             <div id="visagism-styles" className="bg-gray-900/50 p-6 rounded-xl space-y-4">
                 <h3 className="text-xl font-semibold text-emerald-300 border-b border-gray-700 pb-2 mb-3">Cortes Recomendados</h3>
                 <div className="space-y-6">
                     {report.styles.map((style, idx) => (
                         <StyleCard key={idx} style={style} index={idx} />
                     ))}
                 </div>
             </div>
        </div>
      </div>
    </div>
  );
};
