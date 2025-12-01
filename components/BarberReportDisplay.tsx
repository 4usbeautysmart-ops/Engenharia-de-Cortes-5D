import React, { useState } from 'react';
import type { BarberReport, SimulatedTurnaround } from '../types';
import { Icon } from './Icon';
import { ZoomableImage } from './ZoomableImage';
import { generateBarberPdf } from '../utils/pdfGenerator';
import { TurnaroundView } from './TurnaroundView';

interface BarberReportDisplayProps {
  report: BarberReport;
  clientImage: string;
  referenceImage: string;
  simulatedImage: SimulatedTurnaround;
  onReset: () => void;
  setIsLoading: (isLoading: boolean) => void;
  setLoadingMessage: (message: string) => void;
  setShareMessage: (message: string | null) => void;
}

export const BarberReportDisplay: React.FC<BarberReportDisplayProps> = ({ 
    report, 
    clientImage, 
    referenceImage,
    simulatedImage, 
    onReset,
    setIsLoading,
    setLoadingMessage,
    setShareMessage
}) => {
    const [activeTab, setActiveTab] = useState<'hair' | 'beard' | 'products'>('hair');

    const handleShareOrDownloadPdf = async () => {
        setIsLoading(true);
        setLoadingMessage('Gerando dossiê do barbeiro...');
        setShareMessage(null);
        try {
            const pdfBlob = await generateBarberPdf(report, clientImage, simulatedImage.front);
            const pdfFile = new File([pdfBlob], 'dossie-barbeiro.pdf', { type: 'application/pdf' });
            
            if (navigator.share && navigator.canShare({ files: [pdfFile] })) {
                await navigator.share({
                    title: 'Dossiê Barbeiro Visagista',
                    text: `Análise para ${report.haircut.styleName}`,
                    files: [pdfFile],
                });
            } else {
                const link = document.createElement('a');
                link.href = URL.createObjectURL(pdfBlob);
                link.download = 'dossie-barbeiro.pdf';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(link.href);
                setShareMessage("PDF baixado com sucesso!");
            }
        } catch (err) {
            console.error("PDF error", err);
            setShareMessage('Erro ao gerar PDF.');
        } finally {
            setIsLoading(false);
            setTimeout(() => setShareMessage(null), 4000);
        }
    };

    return (
        <div className="bg-gray-800 rounded-2xl p-6 h-full flex flex-col border border-gray-700">
            <div className="flex-shrink-0 flex justify-between items-center pb-4 mb-4 border-b border-gray-700">
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 uppercase tracking-wide">
                    Barbeiro Visagista
                </h2>
                <div className="flex items-center gap-2">
                    <button onClick={handleShareOrDownloadPdf} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-500 transition-colors text-sm uppercase">
                        <Icon name="share" className="w-5 h-5" />
                        Compartilhar / Baixar Dossiê
                    </button>
                    <button onClick={onReset} className="px-4 py-2 bg-gray-700 text-white rounded-lg font-bold hover:bg-gray-600 transition-colors text-sm uppercase">
                        Nova Análise
                    </button>
                </div>
            </div>

            <div className="flex-grow overflow-y-auto pr-2 grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column: Visuals & Analysis */}
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                            <h3 className="font-bold text-gray-400 mb-2 uppercase text-xs tracking-wider">Original</h3>
                            <ZoomableImage src={clientImage} alt="Cliente" />
                        </div>
                        <div className="text-center">
                            <h3 className="font-bold text-blue-400 mb-2 uppercase text-xs tracking-wider">Simulação 3D</h3>
                             <TurnaroundView
                                frontImage={simulatedImage.front}
                                sideImage={simulatedImage.side}
                                backImage={simulatedImage.back}
                            />
                        </div>
                    </div>

                    <div className="bg-gray-900/50 p-6 rounded-sm border-l-4 border-blue-500">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                             <Icon name="face" className="w-6 h-6 text-blue-400"/>
                             Análise Facial Masculina
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs text-blue-400 uppercase font-bold">Formato do Rosto</p>
                                <p className="text-lg text-white font-medium">{report.faceAnalysis.shape}</p>
                            </div>
                            <div>
                                <p className="text-xs text-blue-400 uppercase font-bold">Características</p>
                                <p className="text-gray-300 text-sm">{report.faceAnalysis.features}</p>
                            </div>
                             <div>
                                <p className="text-xs text-blue-400 uppercase font-bold">Recomendação Geral</p>
                                <p className="text-gray-300 text-sm italic">"{report.faceAnalysis.recommendation}"</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Technical Details */}
                <div className="flex flex-col h-full">
                     <div className="flex mb-4 bg-gray-900/50 p-1 rounded-lg">
                        <button 
                            onClick={() => setActiveTab('hair')} 
                            className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider rounded-md transition-all ${activeTab === 'hair' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >
                            Corte & Fade
                        </button>
                        <button 
                            onClick={() => setActiveTab('beard')} 
                            className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider rounded-md transition-all ${activeTab === 'beard' ? 'bg-amber-700 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >
                            Barba
                        </button>
                        <button 
                            onClick={() => setActiveTab('products')} 
                            className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider rounded-md transition-all ${activeTab === 'products' ? 'bg-emerald-700 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >
                            Produtos
                        </button>
                     </div>

                     <div className="bg-gray-900/30 rounded-xl p-6 border border-gray-700 flex-grow">
                        {activeTab === 'hair' && (
                            <div className="space-y-6 animate-fade-in">
                                <div>
                                    <h3 className="text-2xl font-bold text-white mb-2">{report.haircut.styleName}</h3>
                                    <p className="text-gray-400 leading-relaxed">{report.haircut.description}</p>
                                </div>
                                
                                <div>
                                    <h4 className="text-sm font-bold text-blue-400 uppercase mb-3">Passo a Passo Técnico</h4>
                                    <ul className="space-y-2">
                                        {report.haircut.technicalSteps.map((step, i) => (
                                            <li key={i} className="flex items-start gap-3 text-gray-300 text-sm border-b border-gray-800 pb-2">
                                                <span className="font-mono text-blue-500 font-bold">{i+1}.</span>
                                                {step}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mt-4">
                                     {report.haircut.diagrams.map((diag, i) => (
                                        <div key={i} className="bg-gray-800 p-2 rounded-lg border border-gray-700">
                                            <p className="text-xs text-center text-gray-400 mb-2">{diag.title}</p>
                                            <div dangerouslySetInnerHTML={{ __html: diag.svg }} className="w-full aspect-square bg-gray-900 rounded-md" />
                                        </div>
                                     ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'beard' && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="bg-amber-900/20 p-4 rounded-lg border border-amber-700/30">
                                    <h3 className="text-xl font-bold text-amber-500 mb-2">Análise da Barba</h3>
                                    <p className="text-white mb-4">{report.beard.recommendation}</p>
                                    <div className="h-px bg-amber-700/30 mb-4"></div>
                                    <p className="text-sm text-gray-300"><span className="text-amber-500 font-bold">Manutenção:</span> {report.beard.maintenance}</p>
                                </div>
                            </div>
                        )}

                         {activeTab === 'products' && (
                            <div className="space-y-6 animate-fade-in">
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-4">Produtos Recomendados</h3>
                                    <div className="grid grid-cols-1 gap-3">
                                        {report.finishing.products.map((prod, i) => (
                                            <div key={i} className="bg-gray-800 p-3 rounded-lg flex items-center gap-3">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                                <span className="text-gray-200">{prod}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-2">Dicas de Styling</h3>
                                    <p className="text-gray-300 leading-relaxed">{report.finishing.stylingTips}</p>
                                </div>
                            </div>
                        )}
                     </div>
                </div>
            </div>
        </div>
    );
}