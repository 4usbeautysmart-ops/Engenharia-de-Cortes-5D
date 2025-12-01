


import React from 'react';
import type { HairTherapyReport, SimulatedTurnaround } from '../types';
import { Icon } from './Icon';
import { TurnaroundView } from './TurnaroundView';
import { generateHairTherapyPdf } from '../utils/pdfGenerator';

interface HairTherapyReportDisplayProps {
  report: HairTherapyReport;
  clientImage: string;
  simulatedImage: SimulatedTurnaround;
  onReset: () => void;
  setIsLoading: (isLoading: boolean) => void;
  setLoadingMessage: (message: string) => void;
  setShareMessage: (message: string | null) => void;
}

const DamageMeter: React.FC<{ level: string }> = ({ level }) => {
    const levels = ['Saudável', 'Danos Leves', 'Danos Médios', 'Danos Severos/Químicos'];
    const activeIndex = levels.indexOf(level);
    const colors = ['bg-green-500', 'bg-yellow-500', 'bg-orange-500', 'bg-red-600'];

    return (
        <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700">
            <h4 className="text-sm font-semibold text-cyan-300 mb-3 uppercase tracking-wider">Nível de Dano</h4>
            <div className="flex gap-1 h-3 mb-2">
                {levels.map((l, i) => (
                    <div 
                        key={i} 
                        className={`flex-1 rounded-sm transition-all ${i <= activeIndex ? colors[activeIndex] : 'bg-gray-700'} ${i === activeIndex ? 'ring-2 ring-white scale-105' : 'opacity-40'}`}
                    ></div>
                ))}
            </div>
            <p className={`text-right font-bold ${colors[activeIndex].replace('bg-', 'text-')}`}>{level}</p>
        </div>
    );
};

const ScheduleCard: React.FC<{ week: number, t1: string, t2: string, t3: string }> = ({ week, t1, t2, t3 }) => {
    const getBadgeColor = (type: string) => {
        if (type === 'Hidratação') return 'bg-blue-900/50 text-blue-300 border-blue-500/30';
        if (type === 'Nutrição') return 'bg-amber-900/50 text-amber-300 border-amber-500/30';
        if (type === 'Reconstrução') return 'bg-red-900/50 text-red-300 border-red-500/30';
        return 'bg-gray-800 text-gray-500 border-gray-700';
    };

    return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 flex flex-col items-center">
            <span className="text-xs font-bold text-gray-400 mb-2 uppercase">Semana {week}</span>
            <div className="flex flex-col gap-2 w-full">
                <div className={`text-xs px-2 py-1 rounded border text-center font-medium ${getBadgeColor(t1)}`}>{t1}</div>
                <div className={`text-xs px-2 py-1 rounded border text-center font-medium ${getBadgeColor(t2)}`}>{t2}</div>
                <div className={`text-xs px-2 py-1 rounded border text-center font-medium ${getBadgeColor(t3)}`}>{t3}</div>
            </div>
        </div>
    );
};

export const HairTherapyReportDisplay: React.FC<HairTherapyReportDisplayProps> = ({ 
    report, 
    clientImage, 
    simulatedImage, 
    onReset, 
    setIsLoading, 
    setLoadingMessage, 
    setShareMessage 
}) => {

    const handleShareOrDownloadPdf = async () => {
        setIsLoading(true);
        setLoadingMessage('Gerando Receita Capilar...');
        setShareMessage(null);
        try {
            const pdfBlob = await generateHairTherapyPdf(report, clientImage, simulatedImage.front);
            const pdfFile = new File([pdfBlob], 'dossie-terapia-capilar.pdf', { type: 'application/pdf' });
            
            if (navigator.share && navigator.canShare({ files: [pdfFile] })) {
                await navigator.share({
                    title: 'Dossiê Terapia Capilar',
                    text: `Cronograma de tratamento para ${report.diagnosis.damageLevel}`,
                    files: [pdfFile],
                });
            } else {
                const link = document.createElement('a');
                link.href = URL.createObjectURL(pdfBlob);
                link.download = 'dossie-terapia-capilar.pdf';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(link.href);
                setShareMessage("Dossiê baixado com sucesso!");
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
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-300 uppercase tracking-wide">
                    Terapeuta Capilar
                </h2>
                <div className="flex items-center gap-2">
                    <button onClick={handleShareOrDownloadPdf} className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg font-bold hover:bg-cyan-500 transition-colors text-sm uppercase">
                        <Icon name="share" className="w-5 h-5" />
                        Baixar Dossiê Completo
                    </button>
                    <button onClick={onReset} className="px-4 py-2 bg-gray-700 text-white rounded-lg font-bold hover:bg-gray-600 transition-colors text-sm uppercase">
                        Nova Análise
                    </button>
                </div>
            </div>

            <div className="flex-grow overflow-y-auto pr-2 grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Left Column: Analysis & Visuals */}
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                            <h3 className="font-bold text-gray-400 mb-2 uppercase text-xs tracking-wider">Estado Atual</h3>
                            <div className="aspect-square bg-black rounded-lg overflow-hidden">
                                <img src={clientImage} alt="Atual" className="w-full h-full object-cover" />
                            </div>
                        </div>
                        <div className="text-center">
                            <h3 className="font-bold text-cyan-400 mb-2 uppercase text-xs tracking-wider">Meta: Cabelo Recuperado</h3>
                            <div className="w-full">
                                <TurnaroundView 
                                    frontImage={simulatedImage.front} 
                                    sideImage={simulatedImage.side} 
                                    backImage={simulatedImage.back} 
                                />
                            </div>
                        </div>
                    </div>

                    <DamageMeter level={report.diagnosis.damageLevel} />

                    <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-700">
                         <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                             <Icon name="list" className="w-5 h-5 text-cyan-400"/>
                             Diagnóstico Detalhado
                        </h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between border-b border-gray-800 pb-2">
                                <span className="text-gray-400">Porosidade</span>
                                <span className="font-semibold text-white">{report.diagnosis.porosity}</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-800 pb-2">
                                <span className="text-gray-400">Elasticidade</span>
                                <span className="font-semibold text-white">{report.diagnosis.elasticity}</span>
                            </div>
                            <div className="pt-2">
                                <span className="text-gray-400 block mb-1">Análise Visual:</span>
                                <p className="text-gray-300 italic">{report.diagnosis.visualAnalysis}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Schedule & Products */}
                <div className="space-y-6">
                    
                    {/* Strategy */}
                    <div className="bg-gradient-to-br from-cyan-900/40 to-teal-900/40 p-6 rounded-xl border border-cyan-500/30">
                        <h3 className="text-lg font-bold text-cyan-300 mb-2">Estratégia: {report.treatmentStrategy.focus}</h3>
                        <p className="text-gray-200 text-sm leading-relaxed">{report.treatmentStrategy.explanation}</p>
                    </div>

                    {/* Schedule Grid */}
                    <div>
                         <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                             <Icon name="grid" className="w-5 h-5 text-cyan-400"/>
                             Cronograma Capilar (4 Semanas)
                        </h3>
                        <div className="grid grid-cols-4 gap-2">
                            {report.hairSchedule.map((week) => (
                                <ScheduleCard 
                                    key={week.week} 
                                    week={week.week} 
                                    t1={week.treatment1} 
                                    t2={week.treatment2} 
                                    t3={week.treatment3} 
                                />
                            ))}
                        </div>
                    </div>

                    {/* Products */}
                    <div className="bg-gray-900/30 p-6 rounded-xl border border-gray-700">
                         <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                             <Icon name="store" className="w-5 h-5 text-cyan-400"/>
                             Produtos Prescritos
                        </h3>
                        <div className="space-y-4">
                            {report.recommendedProducts.map((prod, i) => (
                                <div key={i} className="flex gap-4 items-start bg-gray-800 p-3 rounded-lg">
                                    <div className="w-10 h-10 rounded bg-cyan-900/50 flex items-center justify-center text-cyan-400 font-bold text-xs shrink-0">
                                        {i+1}
                                    </div>
                                    <div>
                                        <p className="font-bold text-white text-sm">{prod.name}</p>
                                        <p className="text-xs text-cyan-300 uppercase font-bold mt-1">{prod.category} • {prod.usageFrequency}</p>
                                        <p className="text-xs text-gray-400 mt-1">{prod.reason}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
};