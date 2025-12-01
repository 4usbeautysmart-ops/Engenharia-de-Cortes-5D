import React, { useState } from 'react';
import type { VisagismReport } from '../types';
import { Icon } from './Icon';
import { generateVisagismPdf } from '../utils/pdfGenerator';

interface VisagismReportDisplayProps {
  report: VisagismReport;
  clientImage: string;
  onReset: () => void;
  setIsLoading: (isLoading: boolean) => void;
  setLoadingMessage: (message: string) => void;
  setShareMessage: (message: string | null) => void;
}

const InfoCard: React.FC<{ icon: string; title: string; value: string }> = ({ icon, title, value }) => (
  <div className="bg-gray-700/50 p-4 rounded-lg flex items-center gap-4">
    <div className="bg-emerald-600/20 p-2 rounded-full">
      <Icon name={icon} className="w-6 h-6 text-emerald-300" />
    </div>
    <div>
      <p className="text-sm text-gray-400">{title}</p>
      <p className="font-semibold text-white">{value}</p>
    </div>
  </div>
);

const RecommendationCard: React.FC<{ title: string; description: string; category: string }> = ({ title, description, category }) => {
    let icon = "scissors";
    if (category === "Coloração") icon = "filter";
    if (category === "Penteado") icon = "magic";

    return (
        <div className="bg-gray-700/50 p-4 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
                <Icon name={icon} className="w-5 h-5 text-emerald-400" />
                <h4 className="font-semibold text-white">{title}</h4>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">{description}</p>
        </div>
    );
}

const TipItem: React.FC<{ icon: string; text: string; }> = ({ icon, text }) => (
    <div className="flex items-start gap-3">
        <Icon name={icon} className="w-5 h-5 text-emerald-400 mt-1 flex-shrink-0" />
        <p className="text-gray-300">{text}</p>
    </div>
);

export const VisagismReportDisplay: React.FC<VisagismReportDisplayProps> = ({ report, clientImage, onReset, setIsLoading, setLoadingMessage, setShareMessage }) => {
  const [activeTab, setActiveTab] = useState<'recommendations' | 'avoid'>('recommendations');
  
  const handleShareOrDownloadPdf = async () => {
    setIsLoading(true);
    setLoadingMessage('Gerando PDF do relatório...');
    setShareMessage(null);
    try {
      const pdfBlob = await generateVisagismPdf(report, clientImage);
      const pdfFile = new File([pdfBlob], 'relatorio-visagismo.pdf', { type: 'application/pdf' });
      
      if (navigator.share && navigator.canShare({ files: [pdfFile] })) {
        await navigator.share({
          title: 'Relatório de Visagismo',
          text: `Confira o relatório de visagismo para ${report.faceShape}.`,
          files: [pdfFile],
        });
      } else {
        // Fallback to download
        const link = document.createElement('a');
        link.href = URL.createObjectURL(pdfBlob);
        link.download = 'relatorio-visagismo.pdf';
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
      setIsLoading(false);
      setTimeout(() => setShareMessage(null), 4000);
    }
  };

  return (
    <div className="bg-gray-800 rounded-2xl p-6 h-full flex flex-col">
      <div className="flex-shrink-0 flex justify-between items-center pb-4 mb-4 border-b border-gray-700 gap-4">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-green-400">
          Relatório de Visagismo
        </h2>
        <div className="flex items-center gap-2">
           <button onClick={handleShareOrDownloadPdf} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-500 transition-colors text-sm">
             <Icon name="share" className="w-5 h-5" />
            Compartilhar / Baixar PDF
          </button>
          <button onClick={onReset} className="px-4 py-2 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors text-sm">
            Analisar Outra Foto
          </button>
        </div>
      </div>
      
      <div className="flex-grow overflow-y-auto pr-2 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna Esquerda: Imagem e Análise Facial */}
        <div className="lg:col-span-1 space-y-6">
            <div className="w-full aspect-square rounded-lg overflow-hidden shadow-lg bg-gray-900">
                <img src={clientImage} alt="Cliente" className="w-full h-full object-contain" />
            </div>
            <div className="bg-gray-900/50 p-4 rounded-xl space-y-4">
                <h3 className="text-xl font-semibold text-emerald-300 border-b border-gray-700 pb-2 mb-3">Análise Facial</h3>
                <InfoCard icon="face" title="Formato do Rosto" value={report.faceShape} />
                <InfoCard icon="ruler" title="Testa" value={report.keyFacialFeatures.forehead} />
                <InfoCard icon="ruler" title="Maxilar" value={report.keyFacialFeatures.jawline} />
            </div>
             <div className="bg-gray-900/50 p-4 rounded-xl space-y-4">
                <h3 className="text-xl font-semibold text-emerald-300 border-b border-gray-700 pb-2 mb-3">Análise Capilar</h3>
                <InfoCard icon="hair" title="Tipo de Fio" value={report.hairAnalysis.hairType} />
                <InfoCard icon="grid" title="Densidade" value={report.hairAnalysis.hairDensity} />
                <InfoCard icon="list" title="Condição Atual" value={report.hairAnalysis.currentCondition} />
            </div>
        </div>

        {/* Coluna Direita: Recomendações e Dicas */}
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-900/50 p-4 rounded-xl">
                 <h3 className="text-xl font-semibold text-emerald-300 mb-4">Recomendações de Estilo</h3>
                 <div className="flex p-1 bg-gray-700 rounded-lg mb-4">
                    <button
                        onClick={() => setActiveTab('recommendations')}
                        className={`flex-1 py-2 px-4 rounded-md text-sm text-center font-semibold transition-colors ${activeTab === 'recommendations' ? 'bg-emerald-600 text-white' : 'hover:bg-gray-600'}`}
                    >
                        Estilos que Valorizam
                    </button>
                    <button
                        onClick={() => setActiveTab('avoid')}
                        className={`flex-1 py-2 px-4 rounded-md text-sm text-center font-semibold transition-colors ${activeTab === 'avoid' ? 'bg-red-600/80 text-white' : 'hover:bg-gray-600'}`}
                    >
                        Estilos a Evitar
                    </button>
                </div>
                <div className="space-y-4">
                    {activeTab === 'recommendations' && report.styleRecommendations.map((rec, i) => (
                        <RecommendationCard key={i} title={rec.styleName} description={rec.description} category={rec.category} />
                    ))}
                     {activeTab === 'avoid' && report.stylesToAvoid.map((rec, i) => (
                        <div key={i} className="bg-red-900/20 p-4 rounded-lg border border-red-500/30">
                            <h4 className="font-semibold text-red-300">{rec.styleName}</h4>
                            <p className="text-sm text-gray-300 leading-relaxed">{rec.description}</p>
                        </div>
                    ))}
                </div>
            </div>
            
             <div className="bg-gray-900/50 p-4 rounded-xl space-y-4">
                <h3 className="text-xl font-semibold text-emerald-300">Dicas Adicionais</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        {report.makeupTips.map((tip, i) => <TipItem key={i} icon="makeup" text={tip} />)}
                    </div>
                    <div className="space-y-3">
                        {report.accessoriesTips.map((tip, i) => <TipItem key={i} icon="earrings" text={tip} />)}
                    </div>
                </div>
             </div>

             <div className="bg-gray-900/50 p-4 rounded-xl">
                 <h3 className="text-xl font-semibold text-emerald-300 mb-2">Resumo da Consultoria</h3>
                 <p className="text-gray-300 italic leading-relaxed">{report.summary}</p>
             </div>
        </div>
      </div>
    </div>
  );
};