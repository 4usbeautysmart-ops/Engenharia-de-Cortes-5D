

export interface CuttingPlan {
  styleName: string;
  description: string;
  tools: string[];
  steps: string[];
  diagrams: { title: string; svg: string }[];
  detailedPrompt: string;
  visagismAnalysis: string;
}

export interface HairstylistReport {
  viabilityVerdict: 'Altamente Recomendado' | 'Recomendado com Adaptações' | 'Não Recomendado';
  viabilityJustification: string;
  adaptationRecommendations: string[];
  cuttingPlan: {
    styleName: string;
    steps: string[];
    diagrams: { title: string; svg: string }[];
  };
  homeCare: {
    brand: string;
    products: { name: string; purpose: string }[];
    applicationGuide: string[];
  };
}

export interface BarberReport {
  faceAnalysis: {
    shape: string;
    features: string;
    recommendation: string;
  };
  haircut: {
    styleName: string;
    description: string;
    technicalSteps: string[]; // Steps for fade, scissor work, etc.
    diagrams: { title: string; svg: string }[];
  };
  beard: {
    hasBeard: boolean;
    recommendation: string; // Style to match face
    maintenance: string;
  };
  finishing: {
    products: string[]; // Pomades, oils
    stylingTips: string;
  };
}

export interface Visagism360Report {
  faceShape: string;
  analysis: string;
  physicalFeatures: string;
  colorimetry: {
    season: string;
    characteristics: string;
    bestColors: string[]; // Hex codes
  };
  styles: Array<{
    name: string;
    description: string;
    reason: string;
    technicalDetails: string;
    stylingTips: string;
  }>;
}

export interface HairTherapyReport {
  userComplaint?: string; // Added to store the user's text description
  diagnosis: {
    damageLevel: 'Saudável' | 'Danos Leves' | 'Danos Médios' | 'Danos Severos/Químicos';
    porosity: 'Baixa' | 'Média' | 'Alta';
    elasticity: 'Boa' | 'Frágil' | 'Elástico/Emborrachado';
    visualAnalysis: string; // Description of what AI sees (frizz, split ends, dullness)
  };
  treatmentStrategy: {
    focus: string; // e.g., "Reconstrução Potente" or "Nutrição Intensa"
    explanation: string;
  };
  hairSchedule: Array<{
    week: number;
    treatment1: 'Hidratação' | 'Nutrição' | 'Reconstrução';
    treatment2: 'Hidratação' | 'Nutrição' | 'Reconstrução' | 'Pausa';
    treatment3: 'Hidratação' | 'Nutrição' | 'Reconstrução' | 'Pausa';
  }>;
  recommendedProducts: Array<{
    name: string;
    category: 'Shampoo' | 'Máscara' | 'Condicionador' | 'Finalizador' | 'Tratamento';
    usageFrequency: string;
    reason: string;
  }>;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export interface SavedPlan {
  id: number;
  plan: CuttingPlan;
  referenceImage: string;
  resultImage: string | null;
}

export interface VisagismReport {
  faceShape: string;
  keyFacialFeatures: {
    forehead: string;
    jawline: string;
    nose: string;
    eyes: string;
  };
  hairAnalysis: {
    hairType: string;
    hairDensity: string;
    currentCondition: string;
  };
  styleRecommendations: Array<{
    styleName: string;
    description: string;
    category: 'Corte' | 'Coloração' | 'Penteado';
  }>;
  stylesToAvoid: Array<{
    styleName: string;
    description: string;
  }>;
  makeupTips: string[];
  accessoriesTips: string[];
  summary: string;
}

export interface ColoristReport {
  visagismAndColorimetryAnalysis: {
    skinTone: string;
    contrast: string;
    recommendation: string;
  };
  initialDiagnosis: string;
  products: string[];
  mechasTechnique: {
    name: string;
    description: string;
  };
  applicationSteps: {
    preparation: string[];
    mechas: string[];
    baseColor: string[];
    toning: string[];
    treatment: string[];
  };
  diagrams: { title: string; svg: string }[];
  tryOnImagePrompt: string;
  postChemicalCare: {
    recommendation: string;
    products: string[];
    steps: string[];
  };
}

export interface SimulatedTurnaround {
  front: string;
  side: string;
  back: string;
}

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    aistudio?: AIStudio;
    webkitAudioContext: typeof AudioContext;
    jspdf: any;
    html2canvas: any;
  }
}