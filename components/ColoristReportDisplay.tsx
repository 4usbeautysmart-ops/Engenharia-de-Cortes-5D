
import React, { useState } from 'react';
import type { ColoristReport, SimulatedTurnaround } from '../types';
import { Icon } from './Icon';
import { ZoomableImage } from './ZoomableImage';
import { generateColoristPdf } from '../utils/pdfGenerator';
import { TurnaroundView } from './TurnaroundView';

interface ColoristReportDisplayProps {
  reportData: { report: ColoristReport; tryOnImage: SimulatedTurnaround };
  clientImage: string;
  onReset: () => void;
  setIsLoading: (isLoading: boolean) => void;
  setLoadingMessage: (message: string) => void;
  setShareMessage: (message: string | null) => void;
}

const InfoCard: React.FC<{ icon: string; title: string; value: string; className?: string }> = ({ icon, title, value, className }) => (
  <div className={`bg-gray-700/50 p-4 rounded-lg flex items-center gap-4 ${className}`}>
    <div className="bg-emerald-600/20 p-2 rounded-full">
      <Icon name={icon} className="w-6 h-6 text-emerald-300" />
    </div>
    <div>
      <p className="text-sm text-gray-400">{title}</p>
      <p className="font-semibold text-white">{value}</p>
    </div>
  </div>
);

const StepSection: React.FC<{ title: string; steps: string[] }> = ({ title, steps }) => {
    if (!steps || steps.length === 0) return null;
    return (
        <div>
            <h4 className="text-lg font-semibold text-emerald-300 mb-2">{title}</h4>
            <ul className="list-decimal list-inside space-y-2 text-gray-300">
                {steps.map((step, index) => <li key={index}>{step}</li>)}
            </ul>
        </div>
    );
};


export const ColoristReportDisplay: React.FC<ColoristReportDisplayProps> = ({ reportData, clientImage, onReset, setIsLoading, setLoadingMessage, setShareMessage }) => {
  const { report, tryOnImage } = reportData;
  const [activeTab, setActiveTab] = useState<'steps' | 'diagrams'>('steps');

  const handleShareOrDownloadPdf = async () => {
    setIsLoading(true);
    setLoadingMessage('Gerando PDF do relatório...');
    setShareMessage(null);
    try {
      // Pass the front image for the PDF, as it's the primary "after" shot
      const pdfBlob = await generateColoristPdf({ report, tryOnImage: tryOnImage.front }, clientImage);
      const pdfFile = new File([pdfBlob], 'relatorio-colorimetria.pdf', { type: 'application/pdf' });
      
      if (navigator.share && navigator.canShare({ files: [pdfFile] })) {
        await navigator.share({
          title: 'Relatório de Colorimetria Expert',
          text: `Confira o plano de coloração.`,
          files: [pdfFile],
        });
      } else {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(pdfBlob);
        link.download = 'relatorio-colorimetria.pdf';
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
    <div id="colorist-report-display" className="bg-gray-800 rounded-2xl p-6 h-full flex flex-col">
      <div className="flex-shrink-0 flex justify-between items-center pb-4 mb-4 border-b border-gray-700 gap-4">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-green-400">
          Relatório Colorista Expert
        </h2>
        <div className="flex items-center gap-2">
          <button id="colorist-share-button" onClick={handleShareOrDownloadPdf} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-500 transition-colors text-sm">
            <Icon name="share" className="w-5 h-5" />
            Compartilhar / Baixar PDF
          </button>
          <button onClick={onReset} className="px-4 py-2 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors text-sm">
            Nova Análise
          </button>
        </div>
      </div>
      
      <div className="flex-grow overflow-y-auto pr-2 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Coluna Esquerda: Visuais e Análise */}
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <h3 className="font-semibold mb-2">Antes</h3>
              <ZoomableImage src={clientImage} alt="Cliente - Antes" />
            </div>
            <div className="text-center">
              <h3 className="font-semibold mb-2">Resultado (IA)</h3>
              <TurnaroundView 
                  frontImage={tryOnImage.front} 
                  sideImage={tryOnImage.side} 
                  backImage={tryOnImage.back} 
              />
            </div>
          </div>

          <div className="bg-gray-900/50 p-4 rounded-xl space-y-4 border border-emerald-500/20 shadow-lg shadow-emerald-900/10">
            <h3 className="text-xl font-semibold text-emerald-300 border-b border-gray-700 pb-2 mb-3 flex items-center gap-2">
                <Icon name="face" className="w-5 h-5" />
                Análise de Pele & Harmonização
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoCard icon="color-palette" title="Subtom de Pele Detectado" value={report.visagismAndColorimetryAnalysis.skinTone} />
              <InfoCard icon="filter" title="Contraste Pessoal" value={report.visagismAndColorimetryAnalysis.contrast} />
            </div>
            <div className="bg-emerald-900/20 p-4 rounded-lg border border-emerald-500/30">
                <p className="text-sm font-semibold text-emerald-400 mb-2 flex items-center gap-2">
                    <Icon name="check" className="w-4 h-4" />
                    Insight da IA:
                </p>
                <p className="text-gray-200 text-sm leading-relaxed italic border-l-2 border-emerald-500 pl-3">
                    "{report.visagismAndColorimetryAnalysis.recommendation}"
                </p>
            </div>
          </div>
          
          <div className="bg-gray-900/50 p-4 rounded-xl space-y-4">
             <h3 className="text-xl font-semibold text-emerald-300 border-b border-gray-700 pb-2 mb-3">Diagnóstico e Produtos (Salão)</h3>
             <InfoCard icon="hair" title="Diagnóstico Inicial" value={report.initialDiagnosis} className="items-start" />
             <div>
                <h4 className="text-lg font-semibold text-white mb-2">Produtos para o Procedimento</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-300">
                    {report.products.map((prod, i) => <li key={i}>{prod}</li>)}
                </ul>
             </div>
          </div>
        </div>

        {/* Coluna Direita: Plano Técnico */}
        <div className="space-y-6">
            <div className="bg-gray-900/50 p-4 rounded-xl flex flex-col">
            <h3 className="text-xl font-semibold text-emerald-300 border-b border-gray-700 pb-2 mb-3">Plano de Execução Técnico (Salão)</h3>
            <div id="colorist-report-tabs" className="flex p-1 bg-gray-700 rounded-lg mb-4">
                <button
                    onClick={() => setActiveTab('steps')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 text-sm font-medium rounded-md transition-colors ${activeTab === 'steps' ? 'bg-emerald-600 text-white' : 'text-gray-300 hover:bg-gray-600'}`}
                >
                    <Icon name="list" className="w-5 h-5"/>
                    Passo a Passo
                </button>
                <button
                    onClick={() => setActiveTab('diagrams')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 text-sm font-medium rounded-md transition-colors ${activeTab === 'diagrams' ? 'bg-emerald-600 text-white' : 'text-gray-300 hover:bg-gray-600'}`}
                >
                    <Icon name="diagram" className="w-5 h-5"/>
                    Diagramas da Técnica
                </button>
            </div>

            <div className="pr-2">
                {activeTab === 'steps' && (
                    <div className="space-y-6">
                        <div>
                            <h4 className="text-lg font-semibold text-emerald-300 mb-2">Técnica de Mechas: {report.mechasTechnique.name}</h4>
                            <p className="text-gray-300">{report.mechasTechnique.description}</p>
                        </div>
                        <StepSection title="Preparação" steps={report.applicationSteps.preparation} />
                        <StepSection title="Aplicação das Mechas" steps={report.applicationSteps.mechas} />
                        <StepSection title="Aplicação da Cor de Base" steps={report.applicationSteps.baseColor} />
                        <StepSection title="Tonalização" steps={report.applicationSteps.toning} />
                        <StepSection title="Tratamento (no Salão)" steps={report.applicationSteps.treatment} />
                    </div>
                )}
                {activeTab === 'diagrams' && (
                    <div className="grid grid-cols-1 gap-6">
                        {report.diagrams.map((diagram, index) => (
                            <div key={index} className="group relative bg-gray-700/50 p-4 rounded-lg flex flex-col items-center">
                                <h4 className="font-semibold mb-2 text-gray-200">{diagram.title}</h4>
                                <div className="bg-white rounded p-2 w-full aspect-square" dangerouslySetInnerHTML={{ __html: diagram.svg }} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
            </div>
            {report.postChemicalCare && (
                <div className="bg-gray-900/50 p-4 rounded-xl">
                    <h3 className="text-xl font-semibold text-emerald-300 border-b border-gray-700 pb-2 mb-3">Cuidados Pós-Química (Home Care)</h3>
                    <div className="space-y-4">
                        <p className="text-gray-300 italic">{report.postChemicalCare.recommendation}</p>
                        <div>
                            <h4 className="text-lg font-semibold text-white mb-2">Produtos Recomendados</h4>
                            <ul className="list-disc list-inside space-y-1 text-gray-300">
                                {report.postChemicalCare.products.map((prod, i) => <li key={i}>{prod}</li>)}
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-lg font-semibold text-white mb-2">Passo a Passo de Uso</h4>
                             <ol className="list-decimal list-inside space-y-2 text-gray-300">
                                {report.postChemicalCare.steps.map((step, i) => <li key={i}>{step}</li>)}
                            </ol>
                        </div>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
