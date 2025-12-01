




import React, { useEffect, useState, useMemo, useRef } from 'react';

interface TutorialOverlayProps {
  step: number;
  onNext: () => void;
  onSkip: () => void;
  tutorialType: 'analyze' | 'color-expert' | 'visagism-360' | 'barber' | 'therapy' | null;
}

interface TutorialStep {
  title: string;
  content: string;
  targetId?: string;
  position?: 'center' | 'top' | 'bottom' | 'left' | 'right';
}

const analyzeTutorialSteps: TutorialStep[] = [
  {
    title: 'Bem-vindo(a) à Engenharia de Cortes 5D!',
    content: 'Este é um tour rápido para mostrar como você pode transformar uma simples foto em um plano de corte completo. Vamos começar?',
    position: 'center',
  },
  {
    title: '1. O Ponto de Partida',
    content: 'Tudo começa aqui. Clique ou arraste uma foto de referência do corte que você deseja analisar.',
    targetId: 'image-uploader-container',
    position: 'bottom',
  },
  {
    title: '2. Mágica da IA',
    content: 'Perfeito! Agora nossa IA está analisando a foto para criar um plano detalhado, diagramas e uma visualização realista. Isso leva apenas um instante.',
    position: 'center',
  },
  {
    title: '3. Seu Plano de Corte',
    content: 'Aqui está seu plano completo! Navegue pelas abas para ver os passos detalhados, os diagramas técnicos e a imagem de resultado realista gerada pela IA.',
    targetId: 'cutting-plan-display',
    position: 'bottom',
  },
  {
    title: '4. Análise de Visagismo',
    content: 'A IA também detecta e analisa o rosto na foto de referência. Clique nesta aba para ver uma análise detalhada sobre o formato do rosto e por que este corte é uma boa combinação.',
    targetId: 'tab-visagism',
    position: 'bottom',
  },
  {
    title: '5. Ferramentas de Criação',
    content: 'Este painel contém ações poderosas. Você pode editar a imagem com texto, aplicar filtros, gerar uma animação, e muito mais.',
    targetId: 'action-buttons',
    position: 'top',
  },
  {
    title: '6. Salve Seu Trabalho',
    content: 'Gostou do resultado? Clique aqui para salvar o plano no seu navegador e acessá-lo a qualquer momento.',
    targetId: 'action-button-save',
    position: 'top',
  },
  {
    title: '7. Acesse Seus Planos',
    content: 'Todos os seus planos salvos ficam aqui, organizados e prontos para serem carregados novamente.',
    targetId: 'header-saved-plans-button',
    position: 'left',
  },
  {
    title: '8. Assistente Virtual',
    content: 'Tem alguma dúvida sobre técnicas, produtos ou tendências? Nosso chatbot especialista está aqui para ajudar.',
    targetId: 'chat-panel-container',
    position: 'left',
  },
  {
    title: 'Tour Concluído!',
    content: 'Você está pronto para criar! Explore, experimente e eleve sua arte de cortar cabelos para a próxima dimensão.',
    position: 'center',
  },
];

const coloristTutorialSteps: TutorialStep[] = [
  {
    title: 'Bem-vindo(a) ao Colorista Expert!',
    content: 'Vamos criar um plano de coloração completo e personalizado, desde o diagnóstico até a simulação do resultado.',
    position: 'center',
  },
  {
    title: '1. Foto da Cliente',
    content: 'Comece enviando uma foto nítida e atual do cabelo da sua cliente. Isso é crucial para o diagnóstico da IA.',
    targetId: 'colorist-client-photo-container',
    position: 'right',
  },
  {
    title: '2. Inspiração de Cor',
    content: 'Agora, forneça a inspiração. Você pode enviar uma foto de referência ou descrever a cor desejada em detalhes.',
    targetId: 'colorist-inspiration-container',
    position: 'left',
  },
  {
    title: '3. Marca de Cosméticos',
    content: 'Selecione a marca que você usa. A IA criará a fórmula e as recomendações usando produtos específicos desta marca.',
    targetId: 'brand-select',
    position: 'top',
  },
  {
    title: '4. Gerar Análise',
    content: 'Tudo pronto! Clique aqui para a IA criar o diagnóstico, a fórmula, a técnica e uma simulação do resultado.',
    targetId: 'colorist-generate-button',
    position: 'top',
  },
  {
    title: '5. Mágica da IA',
    content: 'Aguarde um momento... Nossa IA está processando as imagens, analisando a colorimetria e montando seu relatório exclusivo.',
    position: 'center',
  },
  {
    title: '6. Relatório Completo',
    content: 'Aqui está! Veja a simulação do resultado, a análise de visagismo, os produtos e o passo a passo da aplicação.',
    targetId: 'colorist-report-display',
    position: 'bottom',
  },
  {
    title: '7. Plano Técnico',
    content: 'Navegue entre o passo a passo detalhado da aplicação e os diagramas técnicos que ilustram a técnica de mechas.',
    targetId: 'colorist-report-tabs',
    position: 'top',
  },
  {
    title: '8. Compartilhe e Finalize',
    content: 'Gostou? Compartilhe este relatório profissional com sua cliente ou baixe o PDF para seus arquivos com um clique.',
    targetId: 'colorist-share-button',
    position: 'left',
  },
  {
    title: 'Tour Concluído!',
    content: 'Agora você pode criar cores incríveis com a precisão e a criatividade da IA. Explore e inspire-se!',
    position: 'center',
  },
];

const visagism360TutorialSteps: TutorialStep[] = [
    {
        title: 'Bem-vindo ao Visagismo 360°',
        content: 'Descubra a análise mais completa do mercado: formato de rosto, psicologia da imagem, colorimetria e sugestões de corte em um só lugar.',
        position: 'center',
    },
    {
        title: '1. Foto da Cliente',
        content: 'Envie uma foto de rosto da cliente. Para melhores resultados, a foto deve ser frontal, com boa iluminação e sem filtros.',
        targetId: 'visagism-upload-container',
        position: 'right',
    },
    {
        title: '2. Iniciar Consultoria',
        content: 'Clique aqui para iniciar. A IA analisará proporções, tons de pele e traços para gerar um dossiê completo.',
        targetId: 'visagism-generate-btn',
        position: 'top',
    },
    {
        title: '3. Análise Facial Profunda',
        content: 'Aqui você vê o formato do rosto, mas também a "Impressão Psicológica" — o que a imagem da cliente transmite (força, suavidade, dinamismo).',
        targetId: 'visagism-face-analysis',
        position: 'right',
    },
    {
        title: '4. Colorimetria Pessoal',
        content: 'Descubra a estação cromática e a paleta de cores ideal. Clique nas cores para copiar o código HEX.',
        targetId: 'visagism-colorimetry',
        position: 'left',
    },
    {
        title: '5. Cortes Recomendados',
        content: 'A IA sugere 3 estilos perfeitos. Cada card tem abas para ver os detalhes técnicos (para você) e dicas de finalização (para a cliente).',
        targetId: 'visagism-styles',
        position: 'left',
    },
    {
        title: '6. Exporte o Dossiê',
        content: 'Gere um PDF profissional com toda essa análise para enviar à cliente ou imprimir.',
        targetId: 'visagism-export-btn',
        position: 'bottom',
    },
    {
        title: 'Tour Concluído!',
        content: 'Você agora tem uma ferramenta poderosa para elevar o valor da sua consultoria. Aproveite!',
        position: 'center',
    },
];

const barberTutorialSteps: TutorialStep[] = [
    {
        title: 'Barbeiro Visagista',
        content: 'Um modo dedicado ao público masculino, focando em harmonia de barba e cortes precisos.',
        position: 'center',
    },
    {
        title: '1. Foto do Cliente',
        content: 'Envie a foto do cliente. A IA analisará o formato do rosto (ex: quadrado, retangular) para sugerir o melhor fade e barba.',
        targetId: 'barber-upload-client',
        position: 'bottom',
    },
    {
        title: '2. Referência (Opcional)',
        content: 'Se o cliente quer um corte específico, envie a foto aqui. Caso contrário, a IA sugerirá o melhor estilo.',
        targetId: 'barber-upload-ref',
        position: 'bottom',
    },
    {
        title: '3. Gerar Consultoria',
        content: 'Clique para gerar a análise completa, incluindo dicas de produtos e manutenção.',
        targetId: 'barber-generate-btn',
        position: 'top',
    },
];

const therapyTutorialSteps: TutorialStep[] = [
    {
        title: 'Terapeuta Capilar',
        content: 'Transforme-se em um tricologista expert! Analise a saúde do fio e prescreva cronogramas capilares personalizados.',
        position: 'center',
    },
    {
        title: '1. Foto do Cabelo',
        content: 'Envie uma foto focada nos fios. Quanto melhor a qualidade, mais precisa será a análise de danos e porosidade.',
        targetId: 'therapy-upload-container',
        position: 'right',
    },
    {
        title: '2. Escolha a Marca',
        content: 'Selecione a marca preferida do cliente. A IA montará a receita usando apenas produtos dessa linha.',
        targetId: 'therapy-generate-btn',
        position: 'top',
    },
    {
        title: '3. Diagnóstico e Receita',
        content: 'Clique para gerar. Você receberá um diagnóstico completo, estratégia de tratamento e o cronograma de 4 semanas.',
        targetId: 'therapy-generate-btn',
        position: 'top',
    },
];


export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ step, onNext, onSkip, tutorialType }) => {
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({ opacity: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);
  
  const tutorialSteps = useMemo(() => {
    if (tutorialType === 'color-expert') return coloristTutorialSteps;
    if (tutorialType === 'visagism-360') return visagism360TutorialSteps;
    if (tutorialType === 'barber') return barberTutorialSteps;
    if (tutorialType === 'therapy') return therapyTutorialSteps;
    return analyzeTutorialSteps; // Padrão
  }, [tutorialType]);
  
  const currentStep = tutorialSteps[step];

  useEffect(() => {
    if (currentStep && currentStep.targetId) {
      const element = document.getElementById(currentStep.targetId);
      if (element) {
        const rect = element.getBoundingClientRect();
        setTargetRect(rect);
        // Avoid scrolling if the element is already fully in view
        if (rect.top < 0 || rect.bottom > window.innerHeight) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } else {
        setTargetRect(null); // Target not found, reset
      }
    } else {
      setTargetRect(null);
    }
  }, [step, currentStep]);

  useEffect(() => {
    if (!currentStep || !tooltipRef.current) return;
    
    // For centered tooltips, no calculation is needed.
    if (currentStep.position === 'center' || !targetRect) {
      setTooltipStyle({
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        opacity: 1,
      });
      return;
    }

    const tooltipEl = tooltipRef.current;
    const { offsetWidth: tooltipWidth, offsetHeight: tooltipHeight } = tooltipEl;
    const offset = 16;
    let preferredPosition = currentStep.position;

    // --- Auto-Flip Logic ---
    // Vertical flip
    const spaceBelow = window.innerHeight - targetRect.bottom;
    const spaceAbove = targetRect.top;
    if (preferredPosition === 'bottom' && spaceBelow < tooltipHeight + offset && spaceAbove > spaceBelow) {
      preferredPosition = 'top';
    }
    if (preferredPosition === 'top' && spaceAbove < tooltipHeight + offset && spaceBelow > spaceAbove) {
      preferredPosition = 'bottom';
    }
    // Horizontal flip
    const spaceRight = window.innerWidth - targetRect.right;
    const spaceLeft = targetRect.left;
    if (preferredPosition === 'right' && spaceRight < tooltipWidth + offset && spaceLeft > spaceRight) {
      preferredPosition = 'left';
    }
    if (preferredPosition === 'left' && spaceLeft < tooltipWidth + offset && spaceRight > spaceLeft) {
      preferredPosition = 'right';
    }

    // --- Position Calculation ---
    let top = 0, left = 0;
    switch (preferredPosition) {
      case 'top':
        top = targetRect.top - tooltipHeight - offset;
        left = targetRect.left + (targetRect.width / 2) - (tooltipWidth / 2);
        break;
      case 'bottom':
        top = targetRect.bottom + offset;
        left = targetRect.left + (targetRect.width / 2) - (tooltipWidth / 2);
        break;
      case 'left':
        top = targetRect.top + (targetRect.height / 2) - (tooltipHeight / 2);
        left = targetRect.left - tooltipWidth - offset;
        break;
      case 'right':
        top = targetRect.top + (targetRect.height / 2) - (tooltipHeight / 2);
        left = targetRect.right + offset;
        break;
    }
    
    // --- Viewport Clamping (Final Guarantee) ---
    if (left < offset) {
      left = offset;
    }
    if (left + tooltipWidth > window.innerWidth - offset) {
      left = window.innerWidth - tooltipWidth - offset;
    }
    if (top < offset) {
      top = offset;
    }
    if (top + tooltipHeight > window.innerHeight - offset) {
      top = window.innerHeight - tooltipHeight - offset;
    }

    setTooltipStyle({
      top: `${top}px`,
      left: `${left}px`,
      opacity: 1,
      transform: 'none', // Position is now absolute
    });

  }, [currentStep, targetRect]);
  
  const isLastStep = step === tutorialSteps.length - 1;

  if (!currentStep) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm"
        style={{
            clipPath: targetRect
            ? `path('M0 0 H${window.innerWidth} V${window.innerHeight} H0 Z M${targetRect.left - 4} ${targetRect.top - 4} H${targetRect.right + 4} V${targetRect.bottom + 4} H${targetRect.left - 4} Z')`
            : 'none',
        }}
      />
       {/* Highlight Box */}
       {targetRect && (
        <div
          className="absolute border-2 border-dashed border-emerald-400 rounded-lg pointer-events-none transition-all duration-300"
          style={{
            left: `${targetRect.left - 4}px`,
            top: `${targetRect.top - 4}px`,
            width: `${targetRect.width + 8}px`,
            height: `${targetRect.height + 8}px`,
          }}
        />
      )}
      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="absolute bg-gray-800 p-6 rounded-lg shadow-2xl shadow-emerald-500/20 w-80 border border-gray-700 transition-all duration-300"
        style={tooltipStyle}
      >
        <h3 className="text-xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-green-400">{currentStep.title}</h3>
        <p className="text-gray-300 mb-6">{currentStep.content}</p>
        <div className="flex justify-center items-center gap-6">
          {!isLastStep && (
            <button onClick={onSkip} className="text-sm text-gray-400 hover:text-white">
              Pular Tour
            </button>
          )}
          <button onClick={isLastStep ? onSkip : onNext} className="px-5 py-2 bg-emerald-600 text-white rounded-md font-medium hover:bg-emerald-500 transition-colors">
            {isLastStep ? 'Concluir' : (step === 0 ? 'Começar' : 'Próximo')}
          </button>
        </div>
      </div>
    </div>
  );
};
