import type { CuttingPlan, ColoristReport } from '../types';

export const mockCuttingPlan: CuttingPlan = {
  styleName: "Corte Bob em Camadas (Tutorial)",
  description: "Um corte bob moderno e texturizado que cria volume e movimento, ideal para a demonstração do nosso app.",
  tools: [
    "Tesoura de fio navalha 6 polegadas",
    "Pente de corte",
    "Clipes de seção",
    "Borrifador de água",
    "Escova redonda e secador"
  ],
  steps: [
    "Divida o cabelo em quatro seções principais: duas na frente e duas atrás, prendendo com clipes.",
    "Comece pela nuca, criando a linha de base do perímetro em um ângulo de 0 graus.",
    "Trabalhe em subseções verticais, elevando o cabelo a 45 graus para criar as primeiras camadas.",
    "Avance para as laterais, conectando as camadas da parte de trás com a da frente, mantendo o ângulo.",
    "Finalize texturizando as pontas com a tesoura para adicionar leveza e movimento ao corte."
  ],
  diagrams: [
    {
      title: "Vista Posterior - Divisões",
      svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="grad1" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" style="stop-color:rgb(255,255,255);stop-opacity:0.1" />
            <stop offset="100%" style="stop-color:rgb(0,0,0);stop-opacity:0.2" />
          </radialGradient>
        </defs>
        <style>
            .base-head { fill: #e5e7eb; stroke: #9ca3af; stroke-width: 0.5; }
            .interactive-path { transition: all 0.2s ease-in-out; }
            .interactive-path:hover { stroke-width: 1.5; filter: drop-shadow(0 0 3px #f59e0b); }
            .highlight .interactive-path { stroke-width: 1.5; stroke: #10b981; filter: drop-shadow(0 0 3px #10b981); }
            .hair-section { fill:none; stroke-dasharray: 4 2; stroke-width: 0.8; stroke-linecap: round; }
            .cut-line { fill:none; stroke-width: 1; stroke-linecap: round; }
        </style>
        <path class="base-head" d="M 50,10 C 25,10 20,30 20,55 C 20,75 25,85 30,90 L 70,90 C 75,85 80,75 80,55 C 80,30 75,10 50,10 Z" />
        <path fill="url(#grad1)" d="M 50,10 C 25,10 20,30 20,55 C 20,75 25,85 30,90 L 70,90 C 75,85 80,75 80,55 C 80,30 75,10 50,10 Z" />
        <g id="step-1">
          <title>Divisões (Passo 1)</title>
          <path class="hair-section interactive-path" stroke="#f59e0b" d="M22 40 Q 50 45, 78 40" />
          <path class="hair-section interactive-path" stroke="#f59e0b" d="M25 55 Q 50 60, 75 55" />
          <path class="hair-section interactive-path" stroke="#f59e0b" d="M30 70 Q 50 75, 70 70" />
        </g>
        <g id="step-2">
           <title>Linha de Base (Passo 2)</title>
           <path class="cut-line interactive-path" stroke="#34d399" d="M32 88 L 68 88" />
           <text x="50" y="94" font-family="sans-serif" font-size="5" fill="#60a5fa" text-anchor="middle">0°</text>
        </g>
      </svg>`
    },
    {
      title: "Vista Lateral - Projeção a 45°",
      svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:rgb(0,0,0);stop-opacity:0.2" />
            <stop offset="100%" style="stop-color:rgb(255,255,255);stop-opacity:0.1" />
          </linearGradient>
        </defs>
        <style>
          .base-head { fill: #e5e7eb; stroke: #9ca3af; stroke-width: 0.5; }
          .interactive-path { transition: all 0.2s ease-in-out; cursor: pointer; }
          .interactive-path:hover { stroke-width: 2.5; filter: drop-shadow(0 0 4px #34d399); }
          .highlight .interactive-path { stroke-width: 2.5; stroke: #10b981; filter: drop-shadow(0 0 4px #10b981); }
          .hair-strand { fill:none; stroke: #34d399; stroke-width: 2; stroke-linecap: round; }
          .guideline { fill:none; stroke: #60a5fa; stroke-dasharray: 2 2; stroke-width: 0.6; }
          .angle-arc { fill:none; stroke: #60a5fa; stroke-width: 0.8; }
        </style>
        <g id="step-3">
          <title>Projeção da mecha (Passo 3)</title>
          <path class="base-head" d="M 88,30 C 95,40 95,60 85,70 Q 80,85 70,95 L 55,95 C 45,85 40,70 40,55 C 40,30 65,10 83,15 L 88,30 Z" />
          <path fill="url(#grad2)" d="M 88,30 C 95,40 95,60 85,70 Q 80,85 70,95 L 55,95 C 45,85 40,70 40,55 C 40,30 65,10 83,15 L 88,30 Z" />
          <path class="hair-strand interactive-path" d="M55 75 L 20 40" />
          <path class="guideline" d="M55 75 V 30" />
          <path class="angle-arc" d="M55 55 A 20 20 0 0 1 37.5 40.5" />
          <text x="32" y="52" font-family="sans-serif" font-size="5" fill="#60a5fa">45°</text>
        </g>
      </svg>`
    }
  ],
  visagismAnalysis: "Análise de Visagismo (Tutorial): O rosto na imagem de referência possui formato oval, considerado universalmente harmonioso. O corte bob em camadas complementa este formato ao adicionar volume nas laterais sem alargar a face. A franja lateral suaviza a testa. Este corte também é recomendado para rostos em formato de coração e triangular, pois equilibra a mandíbula. Para rostos redondos, seria ideal alongar um pouco mais o comprimento na frente.",
  detailedPrompt: "foto de estúdio de uma mulher com um corte de cabelo bob em camadas, cabelo castanho com reflexos sutis, sorrindo, iluminação suave, fundo neutro, foto ultra-realista, 8k"
};

// Placeholder 1x1 black pixel GIF, encoded in base64
const placeholderBase64 = "R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=";

export const mockRealisticImage = `data:image/gif;base64,${placeholderBase64}`;
export const mockReferenceImage = placeholderBase64;
export const mockClientImageForColor = `data:image/gif;base64,${placeholderBase64}`;

export const mockColoristReport: { report: ColoristReport, tryOnImage: string } = {
  report: {
    visagismAndColorimetryAnalysis: {
      skinTone: "Neutro (Tutorial)",
      contrast: "Médio Contraste",
      recommendation: "A cor de inspiração harmoniza perfeitamente, pois os tons de mel e dourado realçam o brilho natural da pele."
    },
    initialDiagnosis: "Base 5.0 com 20% de fios brancos distribuídos, pontas levemente ressecadas.",
    products: [
      "Pó Descolorante (Ex: Wella Blondor)",
      "Oxidante 20 vol (6%) (Ex: Wella Welloxon)",
      "Tonalizante 8.31 (Ex: Wella Color Touch)",
      "Tratamento Pós-Química (Ex: WellaPlex)"
    ],
    mechasTechnique: {
      name: "Morena Iluminada (Eriçado)",
      description: "Técnica de eriçado com papel alumínio para criar um degradê suave da raiz às pontas, preservando o fundo natural."
    },
    applicationSteps: {
      preparation: ["Proteger o contorno com creme de barreira.", "Dividir o cabelo em quatro seções."],
      mechas: ["Começar pela nuca, eriçando mechas finas e aplicando o descolorante.", "Deixar agir até o fundo de clareamento desejado (altura de 8)."],
      baseColor: ["Não é necessário aplicar cor base para preservar o fundo natural."],
      toning: ["Aplicar o tonalizante globalmente sobre o cabelo úmido e massagear.", "Deixar agir por 15 minutos e enxaguar."],
      treatment: ["Aplicar a máscara de tratamento, deixar agir por 10 minutos e finalizar."]
    },
    diagrams: [
       {
        title: "Divisão para Mechas Eriçadas",
        svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><style>.s{stroke:#9ca3af;stroke-width:0.5;fill:none;}.l{stroke:#f59e0b;stroke-dasharray:4 2;fill:none;}</style><path class="s" d="M 50,10 C 25,10 20,30 20,55 C 20,75 25,85 30,90 H 70 C 75,85 80,75 80,55 C 80,30 75,10 50,10 Z" fill="#e5e7eb"/><path class="l" d="M22 40 Q 50 45, 78 40" /><path class="l" d="M25 55 Q 50 60, 75 55" /></svg>`
      }
    ],
    tryOnImagePrompt: "A tutorial prompt for generating a brunette with honey highlights.",
    postChemicalCare: {
      recommendation: "Manter a cor vibrante com tratamentos semanais e usar protetor térmico.",
      products: ["Shampoo para Cabelos Coloridos", "Máscara de Nutrição", "Leave-in com proteção UV"],
      steps: ["Lavar com shampoo, aplicar máscara, enxaguar e finalizar com leave-in antes de secar."]
    }
  },
  tryOnImage: mockRealisticImage,
};