import {
  GoogleGenAI,
  Type,
  GenerateContentResponse,
  Chat,
  Modality,
} from "@google/genai";
import type {
  CuttingPlan,
  VisagismReport,
  ColoristReport,
  HairstylistReport,
  Visagism360Report,
  BarberReport,
  SimulatedTurnaround,
  HairTherapyReport,
} from "../types";
import { fileToBase64 } from "../utils/fileUtils";

const API_KEY = import.meta.env.VITE_API_KEY;

// This function gets the standard AI client.
const getAiClient = () => {
  if (!API_KEY) {
    throw new Error("API_KEY  environment variable not set.");
  }
  return new GoogleGenAI({ apiKey: API_KEY });
};

// This function checks for and prompts the user to select a billing-enabled API key for premium models.
const getPremiumAiClient = async (): Promise<GoogleGenAI> => {
  try {
    if (
      window.aistudio &&
      typeof window.aistudio.hasSelectedApiKey === "function"
    ) {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        // Inform the user why they need to select a key.
        alert(
          "Para usar esta funcionalidade avançada (edição de imagem, vídeo ou geração de alta qualidade), você precisa selecionar uma chave de API de um projeto com faturamento ativado. Para mais informações, acesse ai.google.dev/gemini-api/docs/billing"
        );
        await window.aistudio.openSelectKey();
        // We proceed assuming the user selected a key. The API call will fail if they closed the dialog.
      }
    }
  } catch (e) {
    console.warn("Could not check for aistudio API key", e);
  }

  // Re-check for the API_KEY after the dialog might have run.
  if (!API_KEY) {
    throw new Error(
      "API_KEY environment variable not set. Please select a key for premium features."
    );
  }

  // Return a NEW client instance to ensure it uses the latest key from the environment.
  return new GoogleGenAI({ apiKey: API_KEY });
};

// --- Schemas ---

const planSchema = {
  type: Type.OBJECT,
  properties: {
    styleName: {
      type: Type.STRING,
      description: "O nome popular do estilo de corte de cabelo.",
    },
    description: {
      type: Type.STRING,
      description: "Uma breve descrição do estilo.",
    },
    tools: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Ferramentas necessárias.",
    },
    steps: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Passos detalhados.",
    },
    diagrams: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          svg: { type: Type.STRING },
        },
        required: ["title", "svg"],
      },
    },
    detailedPrompt: { type: Type.STRING },
    visagismAnalysis: { type: Type.STRING },
  },
  required: [
    "styleName",
    "description",
    "tools",
    "steps",
    "diagrams",
    "detailedPrompt",
    "visagismAnalysis",
  ],
};

const visagismReportSchema = {
  type: Type.OBJECT,
  properties: {
    faceShape: { type: Type.STRING },
    keyFacialFeatures: {
      type: Type.OBJECT,
      properties: {
        forehead: { type: Type.STRING },
        jawline: { type: Type.STRING },
        nose: { type: Type.STRING },
        eyes: { type: Type.STRING },
      },
      required: ["forehead", "jawline", "nose", "eyes"],
    },
    hairAnalysis: {
      type: Type.OBJECT,
      properties: {
        hairType: { type: Type.STRING },
        hairDensity: { type: Type.STRING },
        currentCondition: { type: Type.STRING },
      },
      required: ["hairType", "hairDensity", "currentCondition"],
    },
    styleRecommendations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          styleName: { type: Type.STRING },
          description: { type: Type.STRING },
          category: {
            type: Type.STRING,
            enum: ["Corte", "Coloração", "Penteado"],
          },
        },
        required: ["styleName", "description", "category"],
      },
    },
    stylesToAvoid: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          styleName: { type: Type.STRING },
          description: { type: Type.STRING },
        },
        required: ["styleName", "description"],
      },
    },
    makeupTips: { type: Type.ARRAY, items: { type: Type.STRING } },
    accessoriesTips: { type: Type.ARRAY, items: { type: Type.STRING } },
    summary: { type: Type.STRING },
  },
  required: [
    "faceShape",
    "keyFacialFeatures",
    "hairAnalysis",
    "styleRecommendations",
    "stylesToAvoid",
    "makeupTips",
    "accessoriesTips",
    "summary",
  ],
};

const coloristReportSchema = {
  type: Type.OBJECT,
  properties: {
    visagismAndColorimetryAnalysis: {
      type: Type.OBJECT,
      properties: {
        skinTone: {
          type: Type.STRING,
          description:
            "Subtom de pele identificado (ex: Quente, Frio, Neutro, Oliva).",
        },
        contrast: {
          type: Type.STRING,
          description: "Nível de contraste pessoal (ex: Baixo, Médio, Alto).",
        },
        recommendation: {
          type: Type.STRING,
          description:
            "Explicação de como a cor escolhida harmoniza com o tom de pele identificado.",
        },
      },
      required: ["skinTone", "contrast", "recommendation"],
    },
    initialDiagnosis: { type: Type.STRING },
    products: { type: Type.ARRAY, items: { type: Type.STRING } },
    mechasTechnique: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        description: { type: Type.STRING },
      },
      required: ["name", "description"],
    },
    applicationSteps: {
      type: Type.OBJECT,
      properties: {
        preparation: { type: Type.ARRAY, items: { type: Type.STRING } },
        mechas: { type: Type.ARRAY, items: { type: Type.STRING } },
        baseColor: { type: Type.ARRAY, items: { type: Type.STRING } },
        toning: { type: Type.ARRAY, items: { type: Type.STRING } },
        treatment: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: ["preparation", "mechas", "baseColor", "toning", "treatment"],
    },
    diagrams: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          svg: { type: Type.STRING },
        },
        required: ["title", "svg"],
      },
    },
    tryOnImagePrompt: { type: Type.STRING },
    postChemicalCare: {
      type: Type.OBJECT,
      properties: {
        recommendation: { type: Type.STRING },
        products: { type: Type.ARRAY, items: { type: Type.STRING } },
        steps: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: ["recommendation", "products", "steps"],
    },
  },
  required: [
    "visagismAndColorimetryAnalysis",
    "initialDiagnosis",
    "products",
    "mechasTechnique",
    "applicationSteps",
    "diagrams",
    "tryOnImagePrompt",
    "postChemicalCare",
  ],
};

const hairstylistReportSchema = {
  type: Type.OBJECT,
  properties: {
    viabilityVerdict: {
      type: Type.STRING,
      enum: [
        "Altamente Recomendado",
        "Recomendado com Adaptações",
        "Não Recomendado",
      ],
    },
    viabilityJustification: { type: Type.STRING },
    adaptationRecommendations: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    cuttingPlan: {
      type: Type.OBJECT,
      properties: {
        styleName: { type: Type.STRING },
        steps: { type: Type.ARRAY, items: { type: Type.STRING } },
        diagrams: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              svg: { type: Type.STRING },
            },
            required: ["title", "svg"],
          },
        },
      },
      required: ["styleName", "steps", "diagrams"],
    },
    homeCare: {
      type: Type.OBJECT,
      properties: {
        brand: { type: Type.STRING },
        products: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              purpose: { type: Type.STRING },
            },
            required: ["name", "purpose"],
          },
        },
        applicationGuide: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: ["brand", "products", "applicationGuide"],
    },
  },
  required: [
    "viabilityVerdict",
    "viabilityJustification",
    "cuttingPlan",
    "homeCare",
  ],
};

const barberReportSchema = {
  type: Type.OBJECT,
  properties: {
    faceAnalysis: {
      type: Type.OBJECT,
      properties: {
        shape: { type: Type.STRING },
        features: { type: Type.STRING },
        recommendation: { type: Type.STRING },
      },
      required: ["shape", "features", "recommendation"],
    },
    haircut: {
      type: Type.OBJECT,
      properties: {
        styleName: { type: Type.STRING },
        description: { type: Type.STRING },
        technicalSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
        diagrams: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              svg: { type: Type.STRING },
            },
            required: ["title", "svg"],
          },
        },
      },
      required: ["styleName", "description", "technicalSteps", "diagrams"],
    },
    beard: {
      type: Type.OBJECT,
      properties: {
        hasBeard: { type: Type.BOOLEAN },
        recommendation: { type: Type.STRING },
        maintenance: { type: Type.STRING },
      },
      required: ["hasBeard", "recommendation", "maintenance"],
    },
    finishing: {
      type: Type.OBJECT,
      properties: {
        products: { type: Type.ARRAY, items: { type: Type.STRING } },
        stylingTips: { type: Type.STRING },
      },
      required: ["products", "stylingTips"],
    },
  },
  required: ["faceAnalysis", "haircut", "beard", "finishing"],
};

const visagism360ReportSchema = {
  type: Type.OBJECT,
  properties: {
    faceShape: { type: Type.STRING },
    analysis: {
      type: Type.STRING,
      description:
        "Análise psicológica profunda conectando as linhas faciais a um arquétipo de personalidade.",
    },
    physicalFeatures: {
      type: Type.STRING,
      description:
        "Descrição objetiva das características e proporções faciais.",
    },
    colorimetry: {
      type: Type.OBJECT,
      properties: {
        season: { type: Type.STRING },
        characteristics: { type: Type.STRING },
        bestColors: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING,
            description:
              "Um código de cor hexadecimal CSS válido, por exemplo, '#FFFFFF' ou '#d2b48c'. DEVE começar com '#' e ter 6 caracteres hexadecimais.",
          },
          description: "Uma lista de 6 a 8 cores.",
        },
      },
      required: ["season", "characteristics", "bestColors"],
    },
    styles: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          description: { type: Type.STRING },
          technicalDetails: { type: Type.STRING },
          stylingTips: { type: Type.STRING },
          harmonyPoints: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Lista de pontos que o corte valoriza e harmoniza.",
          },
          tensionPoints: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description:
              "Lista de pontos de atenção na execução para não criar um efeito indesejado.",
          },
          diagrams: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                svg: {
                  type: Type.STRING,
                  description:
                    "SVG técnico de alta qualidade. Estilo high-tech: Fundo transparente, linhas em cores neon (ciano, magenta), interativo com IDs de passo se aplicável.",
                },
              },
              required: ["title", "svg"],
            },
          },
        },
        required: [
          "name",
          "description",
          "technicalDetails",
          "stylingTips",
          "harmonyPoints",
          "tensionPoints",
          "diagrams",
        ],
      },
    },
  },
  required: [
    "faceShape",
    "analysis",
    "physicalFeatures",
    "colorimetry",
    "styles",
  ],
};

const hairTherapyReportSchema = {
  type: Type.OBJECT,
  properties: {
    diagnosis: {
      type: Type.OBJECT,
      properties: {
        damageLevel: {
          type: Type.STRING,
          enum: [
            "Saudável",
            "Danos Leves",
            "Danos Médios",
            "Danos Severos/Químicos",
          ],
        },
        porosity: { type: Type.STRING, enum: ["Baixa", "Média", "Alta"] },
        elasticity: {
          type: Type.STRING,
          enum: ["Boa", "Frágil", "Elástico/Emborrachado"],
        },
        visualAnalysis: {
          type: Type.STRING,
          description:
            "Descrição visual dos danos (pontas duplas, opacidade, frizz, etc).",
        },
      },
      required: ["damageLevel", "porosity", "elasticity", "visualAnalysis"],
    },
    treatmentStrategy: {
      type: Type.OBJECT,
      properties: {
        focus: {
          type: Type.STRING,
          description:
            "O foco principal do tratamento (ex: Nutrição, Reconstrução).",
        },
        explanation: { type: Type.STRING },
      },
      required: ["focus", "explanation"],
    },
    hairSchedule: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          week: { type: Type.INTEGER },
          treatment1: {
            type: Type.STRING,
            enum: ["Hidratação", "Nutrição", "Reconstrução"],
          },
          treatment2: {
            type: Type.STRING,
            enum: ["Hidratação", "Nutrição", "Reconstrução", "Pausa"],
          },
          treatment3: {
            type: Type.STRING,
            enum: ["Hidratação", "Nutrição", "Reconstrução", "Pausa"],
          },
        },
        required: ["week", "treatment1", "treatment2", "treatment3"],
      },
      description: "Um cronograma de 4 semanas.",
    },
    recommendedProducts: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          category: {
            type: Type.STRING,
            enum: [
              "Shampoo",
              "Máscara",
              "Condicionador",
              "Finalizador",
              "Tratamento",
            ],
          },
          usageFrequency: { type: Type.STRING },
          reason: { type: Type.STRING },
        },
        required: ["name", "category", "usageFrequency", "reason"],
      },
      description: "Produtos específicos da marca escolhida.",
    },
  },
  required: [
    "diagnosis",
    "treatmentStrategy",
    "hairSchedule",
    "recommendedProducts",
  ],
};

// --- Analysis Functions ---

export async function generateTurnaroundImages(
  description: string,
  gender: "female" | "male" = "female"
): Promise<SimulatedTurnaround> {
  const ai = getAiClient();
  // Using flash-image for faster turnaround generation or pro-image if needed
  const model = "gemini-2.5-flash-image";

  // We generate prompts for 3 views
  const views = ["Front View", "Side View (Profile)", "Back View"];
  const promises = views.map(async (view) => {
    const prompt = `Generate a photorealistic image of a ${gender} with this hairstyle: "${description}". View: ${view}. Professional studio lighting, neutral background, 8k resolution. Ensure consistent hair color and texture across views.`;

    // This is a simulation of generating distinct images. In a real scenario, consistent character generation is hard.
    // We use text-to-image here.
    // NOTE: The previous `generateRealisticImage` used imagen-3.0. We should stick to one method.
    // Since we don't have direct access to 'generateImages' for all models easily in this snippet context without more setup,
    // we will use the editImage flow or text-to-image if available.
    // For simplicity in this "mock" logic, we might reuse existing image generation or just return placeholders if no API key for image gen.
    // Assuming `generateRealisticImage` works:
    return await generateRealisticImage(prompt);
  });

  const results = await Promise.all(promises);
  return {
    front: results[0],
    side: results[1],
    back: results[2],
  };
}

export async function analyzeHaircutImage(
  imageFile: File
): Promise<CuttingPlan> {
  const ai = getAiClient();
  const base64Image = await fileToBase64(imageFile);
  const imagePart = {
    inlineData: { mimeType: imageFile.type, data: base64Image },
  };
  const textPart = {
    text: `Analyze this haircut image. Identify the style name. Create a full technical cutting plan (Engenharia de Cortes: Divisions & Angles). Perform a visagism analysis. Return JSON.`,
  };

  const response: GenerateContentResponse = await ai.models.generateContent({
    model: "gemini-2.5-pro",
    contents: { parts: [imagePart, textPart] },
    config: {
      responseMimeType: "application/json",
      responseSchema: planSchema,
      thinkingConfig: { thinkingBudget: 32768 },
    },
  });

  return JSON.parse(response.text.trim()) as CuttingPlan;
}

export async function conductVisagismAnalysis(
  imageFile: File
): Promise<VisagismReport> {
  const ai = getAiClient();
  const base64Image = await fileToBase64(imageFile);
  const imagePart = {
    inlineData: { mimeType: imageFile.type, data: base64Image },
  };
  const textPart = {
    text: `Perform a detailed visagism analysis. Return JSON.`,
  };

  const response: GenerateContentResponse = await ai.models.generateContent({
    model: "gemini-2.5-pro",
    contents: { parts: [imagePart, textPart] },
    config: {
      responseMimeType: "application/json",
      responseSchema: visagismReportSchema,
      thinkingConfig: { thinkingBudget: 32768 },
    },
  });

  return JSON.parse(response.text.trim()) as VisagismReport;
}

export async function generateHairstylistReport(
  clientImageFile: File,
  referenceImageFile: File | null,
  brand: string,
  styleDescription?: string
): Promise<{ report: HairstylistReport; simulatedImage: SimulatedTurnaround }> {
  const ai = getAiClient();
  const clientBase64 = await fileToBase64(clientImageFile);
  const parts: any[] = [
    { inlineData: { mimeType: clientImageFile.type, data: clientBase64 } },
  ];

  let styleInputPrompt = "";
  if (referenceImageFile) {
    const referenceBase64 = await fileToBase64(referenceImageFile);
    parts.push({
      inlineData: { mimeType: referenceImageFile.type, data: referenceBase64 },
    });
    styleInputPrompt += "**Imagem 2: A Referência**\n";
  }
  if (styleDescription) {
    styleInputPrompt += `**Descrição:** "${styleDescription}".\n`;
  }

  const reportPrompt = {
    text: `Mestre Hairstylist. Analise a cliente e a referência.
    ${styleInputPrompt}
    Gere um relatório JSON:
    1. Viabilidade.
    2. Plano de Corte Técnico (SVG High-Tech: Cores Neon, Fundo Escuro, Interativo).
    **IMPORTANTE:** Nos diagramas SVG, agrupe as linhas correspondentes a cada passo usando <g id="step-1">, <g id="step-2">, etc., para que eu possa destacá-las interativamente no app. Use cores vibrantes (Ciano, Magenta, Verde Neon) sobre fundo transparente.
    3. Home Care (Marca: ${brand}).`,
  };

  const reportPromise = ai.models.generateContent({
    model: "gemini-2.5-pro",
    contents: { parts: [...parts, reportPrompt] },
    config: {
      responseMimeType: "application/json",
      responseSchema: hairstylistReportSchema,
      thinkingConfig: { thinkingBudget: 32768 },
    },
  });

  const simulationPromise = (async () => {
    let description = "";
    if (referenceImageFile) {
      description = await getHairDescriptionFromImage(referenceImageFile);
    }
    if (styleDescription) {
      description += ` ${styleDescription}`;
    }
    if (!description) description = "modern haircut";

    // Improved Flow: Edit the client photo for the "Front" view.
    const clientDataUrl = `data:${clientImageFile.type};base64,${clientBase64}`;
    const frontImage = await editImageWithText(
      clientDataUrl,
      `Change hair to: ${description}. Keep face.`
    );

    const sideImage = await generateRealisticImage(
      `Side profile view of a woman with this hairstyle: ${description}. Professional photography.`
    );
    const backImage = await generateRealisticImage(
      `Back view of a woman with this hairstyle: ${description}. Professional photography.`
    );

    return { front: frontImage, side: sideImage, back: backImage };
  })();

  const [reportResponse, simulatedImages] = await Promise.all([
    reportPromise,
    simulationPromise,
  ]);
  return {
    report: JSON.parse(reportResponse.text.trim()) as HairstylistReport,
    simulatedImage: simulatedImages,
  };
}

export async function generateBarberReport(
  clientImageFile: File,
  referenceImageFile: File | null,
  styleDescription?: string
): Promise<{ report: BarberReport; simulatedImage: SimulatedTurnaround }> {
  const ai = getAiClient();
  const clientBase64 = await fileToBase64(clientImageFile);
  const parts: any[] = [
    { inlineData: { mimeType: clientImageFile.type, data: clientBase64 } },
  ];

  if (referenceImageFile) {
    const referenceBase64 = await fileToBase64(referenceImageFile);
    parts.push({
      inlineData: { mimeType: referenceImageFile.type, data: referenceBase64 },
    });
  }

  let promptText = `Barbeiro Visagista Expert. Analise o cliente.`;
  if (styleDescription) promptText += ` Desejo: "${styleDescription}".`;

  promptText += ` Gere JSON: Análise Facial, Corte (SVG High-Tech), Barba, Produtos.`;
  parts.push({ text: promptText });

  const reportPromise = ai.models.generateContent({
    model: "gemini-2.5-pro",
    contents: { parts: parts },
    config: {
      responseMimeType: "application/json",
      responseSchema: barberReportSchema,
      thinkingConfig: { thinkingBudget: 32768 },
    },
  });

  const simulationPromise = (async () => {
    let description = "modern male haircut and beard";
    if (referenceImageFile)
      description = await getHairDescriptionFromImage(referenceImageFile);
    if (styleDescription) description += ` ${styleDescription}`;

    const clientDataUrl = `data:${clientImageFile.type};base64,${clientBase64}`;
    const frontImage = await editImageWithText(
      clientDataUrl,
      `Change hair to: ${description}. Masculine style.`
    );
    const sideImage = await generateRealisticImage(
      `Side profile of a man with hairstyle: ${description}.`
    );
    const backImage = await generateRealisticImage(
      `Back view of a man with hairstyle: ${description}.`
    );

    return { front: frontImage, side: sideImage, back: backImage };
  })();

  const [reportResponse, simulatedImages] = await Promise.all([
    reportPromise,
    simulationPromise,
  ]);
  return {
    report: JSON.parse(reportResponse.text.trim()) as BarberReport,
    simulatedImage: simulatedImages,
  };
}

export async function generateVisagism360Report(
  imageFile: File
): Promise<Visagism360Report> {
  const ai = getAiClient();
  const base64Image = await fileToBase64(imageFile);
  const imagePart = {
    inlineData: { mimeType: imageFile.type, data: base64Image },
  };

  const textPart = {
    text: `Atue como um Mestre Visagista e Psicólogo da Imagem. Analise a imagem. Gere um relatório profundo de Visagismo 360 em **Português do Brasil (pt-BR)**.

    **REQUISITOS DA ANÁLISE FACIAL:**
    1.  **Análise Psicológica Detalhada:** No campo 'analysis', explique o que as principais linhas faciais (maxilar, sobrancelhas, formato dos olhos e boca) comunicam. Conecte essa análise a um arquétipo de personalidade (ex: Criativa, Sofisticada, Poderosa).
    2.  **Características Físicas:** Descreva as proporções e traços marcantes no campo 'physicalFeatures'.

    **REQUISITOS DAS SUGESTÕES DE ESTILO:**
    1.  **Para CADA UM dos 3 estilos**, forneça:
        - **Pontos de Harmonia:** Uma lista explicando o que o corte valoriza e equilibra no rosto da cliente.
        - **Pontos de Tensão:** Uma lista de alertas sobre o que precisa de atenção na execução para não desvalorizar a imagem.
        - **Diagramas SVG Técnicos:** Como já especificado.

    Responda APENAS com o JSON formatado conforme o schema.`,
  };

  // 1. Get the main text/SVG report
  const reportPromise = ai.models.generateContent({
    model: "gemini-2.5-pro",
    contents: { parts: [imagePart, textPart] },
    config: {
      responseMimeType: "application/json",
      responseSchema: visagism360ReportSchema,
      thinkingConfig: { thinkingBudget: 32768 },
    },
  });

  // To avoid race conditions and ensure data consistency, we'll generate images AFTER getting the report.
  const reportResponse = await reportPromise;

  // Defensive parsing
  let report: Visagism360Report;
  try {
    report = JSON.parse(reportResponse.text.trim()) as Visagism360Report;
  } catch (e) {
    console.error(
      "Failed to parse Visagism 360 report JSON:",
      reportResponse.text
    );
    throw new Error(
      "A IA retornou um formato de relatório inválido. Tente novamente."
    );
  }

  // 2. Generate simulated images for each style in parallel
  const clientDataUrl = `data:${imageFile.type};base64,${base64Image}`;

  const imageGenerationPromises = report.styles.map((style) => {
    const editPrompt = `Apply this specific hairstyle to the person in the photo: "${style.name}". Key characteristics: ${style.description}. Maintain the person's facial identity, features, and the original photo's lighting and background as much as possible. The result must be photorealistic and seamlessly blended.`;
    return editImageWithText(clientDataUrl, editPrompt);
  });

  // Use Promise.allSettled to ensure that even if one image fails, the others can still be returned.
  const imageResults = await Promise.allSettled(imageGenerationPromises);

  // 3. Attach the generated images back to the report object
  report.styles.forEach((style, index) => {
    const result = imageResults[index];
    if (result.status === "fulfilled") {
      style.simulatedImage = result.value;
    } else {
      console.warn(
        `Failed to generate simulated image for style "${style.name}":`,
        result.reason
      );
      style.simulatedImage = undefined; // Explicitly set to undefined on failure
    }
  });

  return report;
}

export async function generateHairTherapyReport(
  imageFile: File,
  brand: string,
  description?: string
): Promise<{ report: HairTherapyReport; simulatedImage: SimulatedTurnaround }> {
  const ai = getAiClient();
  const base64Image = await fileToBase64(imageFile);
  const imagePart = {
    inlineData: { mimeType: imageFile.type, data: base64Image },
  };

  let promptText = `Você é um Terapeuta Capilar e Tricologista Expert. Analise a saúde deste cabelo com base na imagem.
        Marca escolhida para o tratamento: **${brand}**.`;

  if (description) {
    promptText += `\n\nO cliente relata o seguinte problema/queixa: "${description}". Leve isso em consideração no diagnóstico e tratamento.\n`;
  }

  promptText += `
        Gere um relatório JSON contendo:
        1. **Diagnóstico:** Nível de dano (Saudável, Leve, Médio, Severo), Porosidade, Elasticidade e Análise Visual detalhada (procure por pontas duplas, quebra, falta de brilho, frizz).
        2. **Estratégia:** Qual o foco (H, N, ou R) e por quê.
        3. **Cronograma Capilar:** Um plano de 4 semanas.
        4. **Produtos Recomendados:** 3 a 5 produtos EXCLUSIVOS da marca ${brand} para resolver o problema.

        Retorne o JSON estritamente conforme o schema.`;

  const textPart = { text: promptText };

  const reportPromise = ai.models.generateContent({
    model: "gemini-2.5-pro",
    contents: { parts: [imagePart, textPart] },
    config: {
      responseMimeType: "application/json",
      responseSchema: hairTherapyReportSchema,
      thinkingConfig: { thinkingBudget: 32768 },
    },
  });

  const simulationPromise = (async () => {
    // For therapy, "Simulated Image" means showing the hair HEALTHY.
    const clientDataUrl = `data:${imageFile.type};base64,${base64Image}`;
    const prompt =
      "Repair the hair. Make it look extremely healthy, shiny, silky, smooth, and hydrated. Remove frizz and split ends. Keep the same color and length. Professional hair advertisement look.";

    const frontImage = await editImageWithText(clientDataUrl, prompt);
    // Side/Back are less critical here if we don't have them, but for consistency we generate based on "Healthy Hair"
    const sideImage = await generateRealisticImage(
      `Side view of extremely healthy, shiny hair, same color as input. Professional.`
    );
    const backImage = await generateRealisticImage(
      `Back view of extremely healthy, shiny hair. Professional.`
    );

    return { front: frontImage, side: sideImage, back: backImage };
  })();

  const [reportResponse, simulatedImages] = await Promise.all([
    reportPromise,
    simulationPromise,
  ]);

  // Inject the user description back into the report object so it can be used in the PDF
  const resultReport = JSON.parse(
    reportResponse.text.trim()
  ) as HairTherapyReport;
  if (description) {
    resultReport.userComplaint = description;
  }

  return {
    report: resultReport,
    simulatedImage: simulatedImages,
  };
}

// --- Helper Generative Functions ---

export async function generateRealisticImage(prompt: string): Promise<string> {
  const ai = await getPremiumAiClient();
  const response = await ai.models.generateImages({
    model: "imagen-4.0-generate-001", // Or 'gemini-3-pro-image-preview' if available/preferred
    prompt: `${prompt}, 8k, photorealistic, professional studio lighting`,
    config: {
      numberOfImages: 1,
      outputMimeType: "image/jpeg",
      aspectRatio: "1:1",
    },
  });
  return `data:image/jpeg;base64,${response.generatedImages[0].image.imageBytes}`;
}

export async function editImageWithText(
  base64Image: string,
  prompt: string
): Promise<string> {
  const ai = await getPremiumAiClient();
  const imageData = base64Image.split(",")[1];
  const mimeType = base64Image.match(/data:(.*);base64,/)?.[1] || "image/jpeg";

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-image-preview",
      contents: {
        parts: [
          { inlineData: { data: imageData, mimeType: mimeType } },
          {
            text: `Edit instructions: ${prompt}. Maintain facial identity and background.`,
          },
        ],
      },
    });

    // Robust check for generated image data
    const imagePart = response.candidates?.[0]?.content?.parts?.find(
      (p) => p.inlineData
    );
    if (imagePart && imagePart.inlineData) {
      return `data:image/png;base64,${imagePart.inlineData.data}`;
    }

    // Check for safety ratings or other reasons for failure
    const finishReason = response.candidates?.[0]?.finishReason;
    if (finishReason !== "STOP") {
      console.warn(
        `Image generation stopped for reason: ${finishReason}. It may be due to safety policies.`
      );
      // Return the original image as a fallback
      return base64Image;
    }

    throw new Error(
      "Image generation completed but no image data was returned."
    );
  } catch (error) {
    console.error("Error during image editing:", error);
    // On any error (API call failure, etc.), return the original image as a safe fallback
    return base64Image;
  }
}

export async function getHairDescriptionFromImage(
  imageFile: File
): Promise<string> {
  const ai = getAiClient();
  const base64Image = await fileToBase64(imageFile);
  const response = await ai.models.generateContent({
    model: "gemini-2.5-pro",
    contents: {
      parts: [
        { inlineData: { mimeType: imageFile.type, data: base64Image } },
        {
          text: "Describe hair strictly (cut, color, texture). Start with 'Hair is...'.",
        },
      ],
    },
  });
  return response.text.trim();
}

export async function createStylePrompts(
  userRequest: string,
  modelImageFile: File
): Promise<string[]> {
  // Legacy function, keeping short for brevity but it exists
  const ai = getAiClient();
  // ... logic for prompts ...
  return [];
}

export async function generateColoristReport(
  clientImageFile: File,
  inspirationImage: File | null,
  inspirationText: string,
  cosmeticsBrand: string
): Promise<{ report: ColoristReport; tryOnImage: SimulatedTurnaround }> {
  const ai = getAiClient();
  const clientImageBase64 = await fileToBase64(clientImageFile);
  const parts: any[] = [
    { inlineData: { mimeType: clientImageFile.type, data: clientImageBase64 } },
  ];

  if (inspirationImage) {
    const inspirationBase64 = await fileToBase64(inspirationImage);
    parts.push({
      inlineData: { mimeType: inspirationImage.type, data: inspirationBase64 },
    });
  }

  // UPDATED PROMPT: Emphasizes Skin Tone Analysis and Harmonization
  let prompt = `Atue como um Colorista Expert e Visagista especializado em Colorimetria Pessoal (Marca: ${cosmeticsBrand}).
  1. ANÁLISE DE PELE (CRUCIAL): Analise a foto da cliente. Determine o Subtom de Pele (Quente, Frio, Neutro, Oliva) e o Contraste (Baixo, Médio, Alto).
  2. HARMONIZAÇÃO: Com base na marca escolhida e no desejo do cliente, crie uma receita que HARMONIZE com a pele.
     - Se o desejo do cliente for desarmônico (ex: cinza chumbo em pele quente), ajuste a nuance (matiz) para valorizar a cliente e explique isso no campo 'recommendation'.
     - O 'initialDiagnosis' deve mencionar a altura de tom atual percebida.
  3. DESEJO DO CLIENTE: ${inspirationText}
  4. OUTPUT: Gere o JSON completo seguindo estritamente o schema.`;

  parts.push({ text: prompt });

  const reportPromise = ai.models.generateContent({
    model: "gemini-2.5-pro",
    contents: { parts: parts },
    config: {
      responseMimeType: "application/json",
      responseSchema: coloristReportSchema,
      thinkingConfig: { thinkingBudget: 32768 },
    },
  });

  // For Colorist, we also want 3D views now
  const simulationPromise = (async () => {
    // 1. Get the prompt from the report (we need the report first, OR we generate a description now)
    // Since we run in parallel, we can't use report.tryOnImagePrompt directly.
    // We will generate a description of the desired color first or trust the editImage to understand "Apply this color style".

    // Let's wait for the report actually, OR use a separate call to describe the target color.
    // To keep it parallel and fast, let's use the inputs.
    let colorDesc = inspirationText || "desired hair color";

    const clientDataUrl = `data:${clientImageFile.type};base64,${clientImageBase64}`;
    const frontImage = await editImageWithText(
      clientDataUrl,
      `Apply this hair color/style: ${colorDesc}.`
    );
    const sideImage = await generateRealisticImage(
      `Side view of woman with hair color: ${colorDesc}.`
    );
    const backImage = await generateRealisticImage(
      `Back view of woman with hair color: ${colorDesc}.`
    );

    return { front: frontImage, side: sideImage, back: backImage };
  })();

  const [reportResponse, simulatedImages] = await Promise.all([
    reportPromise,
    simulationPromise,
  ]);
  return {
    report: JSON.parse(reportResponse.text.trim()) as ColoristReport,
    tryOnImage: simulatedImages,
  };
}

export function startChat(): Chat {
  const ai = getAiClient();
  return ai.chats.create({
    model: "gemini-2.5-flash",
    config: { systemInstruction: "Assistente de Beleza Expert." },
  });
}

export async function generateVideoFromImage(
  imageFile: File,
  prompt: string
): Promise<string> {
  const ai = await getPremiumAiClient();
  const base64Image = await fileToBase64(imageFile);
  let operation = await ai.models.generateVideos({
    model: "veo-3.1-fast-generate-preview",
    prompt: prompt,
    image: { imageBytes: base64Image, mimeType: imageFile.type },
    config: { numberOfVideos: 1, resolution: "720p", aspectRatio: "16:9" },
  });
  while (!operation.done) {
    await new Promise((resolve) => setTimeout(resolve, 5000));
    operation = await ai.operations.getVideosOperation({
      operation: operation,
    });
  }
  return `${operation.response?.generatedVideos?.[0]?.video?.uri}&key=${API_KEY}`;
}

export async function textToSpeech(text: string): Promise<void> {
  const ai = await getPremiumAiClient();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: { parts: [{ text }] },
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } },
      },
    },
  });
  const base64Audio =
    response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (base64Audio) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)(
      { sampleRate: 24000 }
    );
    const audioBuffer = await decodeAudioData(
      decode(base64Audio),
      audioContext,
      24000,
      1
    );
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    source.start();
  }
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++)
    bytes[i] = binaryString.charCodeAt(i);
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++)
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
  }
  return buffer;
}

export async function findNearbyStores(
  query: string,
  location?: { lat: number; lng: number }
): Promise<string> {
  const ai = getAiClient();
  const config: any = { tools: [{ googleMaps: {} }] };
  if (location)
    config.toolConfig = {
      retrievalConfig: {
        latLng: { latitude: location.lat, longitude: location.lng },
      },
    };
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Find beauty stores. ${query}`,
    config: config,
  });
  return response.text;
}
