import type { CuttingPlan, VisagismReport, ColoristReport, Visagism360Report, BarberReport, HairTherapyReport, HairstylistReport, SimulatedTurnaround } from '../types';

export async function generatePdf(
  plan: CuttingPlan,
  referenceImage: string,
  resultImage: string | null
): Promise<void> {
  // @ts-ignore
  const { jsPDF } = window.jspdf;
  // @ts-ignore
  const html2canvas = window.html2canvas;

  const doc = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'a4',
  });

  const pageHeight = doc.internal.pageSize.height;
  const pageWidth = doc.internal.pageSize.width;
  const margin = 15;
  let yPos = margin;

  // --- Helpers ---
  const addText = (text: string, size: number, style: 'bold' | 'normal', x: number, y: number, options: any = {}) => {
    doc.setFontSize(size);
    doc.setFont('helvetica', style);
    const splitText = doc.splitTextToSize(text, pageWidth - (margin * 2));
    doc.text(splitText, x, y, options);
    return (splitText.length * (size * 0.35)) + 2; // Return height of the text block
  };

  const checkPageBreak = (heightNeeded: number) => {
    if (yPos + heightNeeded > pageHeight - margin) {
      doc.addPage();
      yPos = margin;
    }
  };
  
  // --- Header ---
  doc.setDrawColor(16, 185, 129); // Emerald color
  doc.setLineWidth(1);
  doc.line(margin, yPos - 5, pageWidth - margin, yPos - 5);
  yPos += addText(plan.styleName, 22, 'bold', margin, yPos);
  yPos += 2;
  yPos += addText(plan.description, 11, 'normal', margin, yPos);
  yPos += 5;
  doc.setDrawColor(209, 213, 219); // Gray color
  doc.setLineWidth(0.2);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 8;

  // --- Images ---
  checkPageBreak(80);
  const imageWidth = (pageWidth - (margin * 3)) / 2;
  const imageHeight = 75;
  
  yPos += addText('Imagens de Referência e Resultado', 14, 'bold', margin, yPos);
  
  if (referenceImage) {
    doc.addImage(`data:image/jpeg;base64,${referenceImage}`, 'JPEG', margin, yPos, imageWidth, imageHeight);
  }
  if (resultImage) {
    doc.addImage(resultImage, 'JPEG', margin + imageWidth + margin, yPos, imageWidth, imageHeight);
  }
  yPos += imageHeight + 8;

  // --- Tools ---
  checkPageBreak(20);
  yPos += addText('Ferramentas Necessárias', 14, 'bold', margin, yPos);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  plan.tools.forEach(tool => {
      checkPageBreak(6);
      doc.text(`• ${tool}`, margin + 5, yPos);
      yPos += 6;
  });
  yPos += 8;
  
  // --- Steps ---
  checkPageBreak(20);
  yPos += addText('Passo a Passo', 14, 'bold', margin, yPos);
  plan.steps.forEach((step, index) => {
    const stepText = `${index + 1}. ${step}`;
    const textLines = doc.splitTextToSize(stepText, pageWidth - margin - (margin + 5));
    const textHeight = textLines.length * (10 * 0.35) + 4;
    checkPageBreak(textHeight);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(textLines, margin, yPos);
    yPos += textHeight;
  });
  yPos += 8;

  // --- Diagrams ---
  checkPageBreak(20);
  yPos += addText('Diagramas', 14, 'bold', margin, yPos);
  
  const diagramContainer = document.createElement('div');
  diagramContainer.style.position = 'absolute';
  diagramContainer.style.left = '-9999px';
  diagramContainer.style.top = '-9999px';
  document.body.appendChild(diagramContainer);

  for (const diagram of plan.diagrams) {
    const svgDiv = document.createElement('div');
    svgDiv.style.width = '250px';
    svgDiv.style.height = '250px';
    svgDiv.style.backgroundColor = 'white';
    svgDiv.style.padding = '10px';
    svgDiv.innerHTML = diagram.svg;
    diagramContainer.appendChild(svgDiv);
    
    const canvas = await html2canvas(svgDiv, {
        backgroundColor: '#ffffff',
        scale: 2,
    });
    const imgData = canvas.toDataURL('image/png');
    
    diagramContainer.removeChild(svgDiv);

    const diagramHeight = 70;
    const diagramWidth = (canvas.width * diagramHeight) / canvas.height;
    
    checkPageBreak(diagramHeight + 10); // height + title
    yPos += addText(diagram.title, 11, 'bold', margin, yPos);

    doc.addImage(imgData, 'PNG', margin, yPos, diagramWidth, diagramHeight);
    yPos += diagramHeight + 8;
  }

  document.body.removeChild(diagramContainer);

  // --- Save ---
  doc.save(`plano-de-corte-${plan.styleName.replace(/\s+/g, '-').toLowerCase()}.pdf`);
}


export async function generateVisagismPdf(
  report: VisagismReport,
  clientImage: string
): Promise<Blob> {
  // @ts-ignore
  const { jsPDF } = window.jspdf;

  const doc = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'a4',
  });

  const pageHeight = doc.internal.pageSize.height;
  const pageWidth = doc.internal.pageSize.width;
  const margin = 15;
  let yPos = margin;
  const colWidth = (pageWidth - margin * 3) / 2;

  // --- Helpers ---
  const addText = (text: string, size: number, style: 'bold' | 'normal' | 'italic', x: number, y: number, maxWidth?: number) => {
    doc.setFontSize(size);
    doc.setFont('helvetica', style);
    const splitText = doc.splitTextToSize(text, maxWidth || (pageWidth - margin * 2));
    doc.text(splitText, x, y);
    return (splitText.length * (size * 0.35)) + 2;
  };
  
  const addSectionTitle = (title: string) => {
     checkPageBreak(15);
     doc.setDrawColor(209, 213, 219);
     doc.setLineWidth(0.2);
     doc.line(margin, yPos, pageWidth - margin, yPos);
     yPos += 8;
     yPos += addText(title, 14, 'bold', margin, yPos);
  }

  const checkPageBreak = (heightNeeded: number) => {
    if (yPos + heightNeeded > pageHeight - margin) {
      doc.addPage();
      yPos = margin;
    }
  };

  // --- Header ---
  doc.setDrawColor(16, 185, 129); // Emerald color
  doc.setLineWidth(1);
  doc.line(margin, yPos - 5, pageWidth - margin, yPos - 5);
  yPos += addText('Relatório de Visagismo', 22, 'bold', margin, yPos);
  yPos += 2;
  yPos += addText(`Análise para Rosto ${report.faceShape}`, 11, 'normal', margin, yPos);
  yPos += 5;
  
  // --- First Section: Image + Analysis ---
  checkPageBreak(80);
  const imageSize = 75;
  doc.addImage(clientImage, 'JPEG', margin, yPos, imageSize, imageSize);

  let rightColX = margin + imageSize + margin;
  let rightColY = yPos;

  rightColY += addText('Análise Facial', 12, 'bold', rightColX, rightColY);
  rightColY += addText(`• Forma do Rosto: ${report.faceShape}`, 10, 'normal', rightColX, rightColY);
  rightColY += addText(`• Testa: ${report.keyFacialFeatures.forehead}`, 10, 'normal', rightColX, rightColY);
  rightColY += addText(`• Maxilar: ${report.keyFacialFeatures.jawline}`, 10, 'normal', rightColX, rightColY);
  
  rightColY += 8;

  rightColY += addText('Análise Capilar', 12, 'bold', rightColX, rightColY);
  rightColY += addText(`• Tipo de Fio: ${report.hairAnalysis.hairType}`, 10, 'normal', rightColX, rightColY);
  rightColY += addText(`• Densidade: ${report.hairAnalysis.hairDensity}`, 10, 'normal', rightColX, rightColY);
  rightColY += addText(`• Condição Atual: ${report.hairAnalysis.currentCondition}`, 10, 'normal', rightColX, rightColY);

  yPos += imageSize + 5;

  // --- Style Recommendations ---
  addSectionTitle('Estilos que Valorizam');
  report.styleRecommendations.forEach(rec => {
    const titleHeight = 6;
    const descHeight = addText(rec.description, 10, 'normal', margin + 5, yPos + titleHeight, pageWidth - margin * 3);
    checkPageBreak(titleHeight + descHeight + 4);
    addText(`• ${rec.styleName} (${rec.category})`, 11, 'bold', margin, yPos);
    addText(rec.description, 10, 'normal', margin + 5, yPos + titleHeight, pageWidth - margin * 3);
    yPos += titleHeight + descHeight + 2;
  });

  // --- Styles to Avoid ---
  addSectionTitle('Estilos a Evitar');
  report.stylesToAvoid.forEach(rec => {
    const titleHeight = 6;
    const descHeight = addText(rec.description, 10, 'normal', margin + 5, yPos + titleHeight, pageWidth - margin * 3);
    checkPageBreak(titleHeight + descHeight + 4);
    addText(`• ${rec.styleName}`, 11, 'bold', margin, yPos);
    addText(rec.description, 10, 'normal', margin + 5, yPos + titleHeight, pageWidth - margin * 3);
    yPos += titleHeight + descHeight + 2;
  });
  
  // --- Additional Tips ---
  addSectionTitle('Dicas Adicionais');
  const leftTipY = yPos;
  const rightTipY = yPos;
  
  const makeupTitleHeight = addText('Maquiagem', 11, 'bold', margin, leftTipY, colWidth);
  let finalLeftY = leftTipY + makeupTitleHeight;
  report.makeupTips.forEach(tip => {
      finalLeftY += addText(`• ${tip}`, 10, 'normal', margin, finalLeftY, colWidth);
  });
  
  const accessoriesTitleHeight = addText('Acessórios', 11, 'bold', margin + colWidth + margin, rightTipY, colWidth);
  let finalRightY = rightTipY + accessoriesTitleHeight;
  report.accessoriesTips.forEach(tip => {
      finalRightY += addText(`• ${tip}`, 10, 'normal', margin + colWidth + margin, finalRightY, colWidth);
  });
  
  yPos = Math.max(finalLeftY, finalRightY) + 5;
  
  // --- Summary ---
  addSectionTitle('Resumo da Consultoria');
  yPos += addText(report.summary, 10, 'italic', margin, yPos);

  // --- Return as Blob ---
  return doc.output('blob');
}


export async function generateViabilityPdf(
  report: string,
  referenceImage: string,
  clientImage: string
): Promise<Blob> {
  // @ts-ignore
  const { jsPDF } = window.jspdf;

  const doc = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'a4',
  });

  const pageHeight = doc.internal.pageSize.height;
  const pageWidth = doc.internal.pageSize.width;
  const margin = 15;
  let yPos = margin;

  // --- Helpers ---
  const checkPageBreak = (heightNeeded: number) => {
    if (yPos + heightNeeded > pageHeight - margin) {
      doc.addPage();
      yPos = margin;
    }
  };

  const addFormattedText = (text: string, x: number, maxWidth: number) => {
    const lines = text.split('\n');
    lines.forEach(line => {
        let style = 'normal';
        let size = 10;
        let processedLine = line.trim();

        if (processedLine.startsWith('###')) {
            style = 'bold';
            size = 12;
            processedLine = processedLine.replace('###', '').trim();
        } else if (processedLine.startsWith('-')) {
            processedLine = `• ${processedLine.substring(1).trim()}`;
        }
        
        processedLine = processedLine.replace(/\*\*(.*?)\*\*/g, '$1'); // Basic bold removal for now

        doc.setFontSize(size);
        doc.setFont('helvetica', style as 'bold' | 'normal');
        
        const splitText = doc.splitTextToSize(processedLine, maxWidth);
        const textHeight = (splitText.length * (size * 0.35)) + 2;
        checkPageBreak(textHeight);
        doc.text(splitText, x, yPos);
        yPos += textHeight;
    });
  };

  // --- Header ---
  doc.setDrawColor(16, 185, 129); // Emerald color
  doc.setLineWidth(1);
  doc.line(margin, yPos - 5, pageWidth - margin, yPos - 5);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('Relatório de Viabilidade', margin, yPos);
  yPos += 10;
  doc.setDrawColor(209, 213, 219); // Gray color
  doc.setLineWidth(0.2);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 8;

  // --- Images ---
  checkPageBreak(85);
  const imageWidth = (pageWidth - (margin * 3)) / 2;
  const imageHeight = 75;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Corte Desejado (Referência)', margin, yPos);
  doc.text('Foto da Cliente', margin + imageWidth + margin, yPos);
  yPos += 5;

  doc.addImage(referenceImage, 'JPEG', margin, yPos, imageWidth, imageHeight);
  doc.addImage(clientImage, 'JPEG', margin + imageWidth + margin, yPos, imageWidth, imageHeight);
  yPos += imageHeight + 10;

  // --- Report Text ---
  addFormattedText(report, margin, pageWidth - margin * 2);

  // --- Return as Blob ---
  return doc.output('blob');
}

export async function generateColoristPdf(
  reportData: { report: ColoristReport; tryOnImage: string },
  clientImage: string
): Promise<Blob> {
  const { report, tryOnImage } = reportData;
  // @ts-ignore
  const { jsPDF } = window.jspdf;
  // @ts-ignore
  const html2canvas = window.html2canvas;

  const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
  const pageHeight = doc.internal.pageSize.height;
  const pageWidth = doc.internal.pageSize.width;
  const margin = 15;
  let yPos = margin;

  const checkPageBreak = (heightNeeded: number) => {
    if (yPos + heightNeeded > pageHeight - margin) {
      doc.addPage();
      yPos = margin;
    }
  };
  
  const addText = (text: string | string[], size: number, style: 'bold' | 'normal' | 'italic', x: number, maxWidth?: number) => {
    doc.setFontSize(size);
    doc.setFont('helvetica', style);
    const splitText = doc.splitTextToSize(text, maxWidth || (pageWidth - margin * 2));
    checkPageBreak(splitText.length * size * 0.35 + 2);
    doc.text(splitText, x, yPos);
    yPos += (splitText.length * (size * 0.35)) + 2;
  };
  
  const addSectionTitle = (title: string) => {
    checkPageBreak(15);
    doc.setDrawColor(209, 213, 219);
    doc.setLineWidth(0.2);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 8;
    addText(title, 14, 'bold', margin);
  };

  // --- Header ---
  addText('Relatório de Colorimetria Expert', 22, 'bold', margin);
  yPos += 5;

  // --- Images ---
  checkPageBreak(85);
  const imageWidth = (pageWidth - (margin * 3)) / 2;
  const imageHeight = 75;
  addText('Antes e Depois', 11, 'bold', margin);
  doc.addImage(clientImage, 'JPEG', margin, yPos, imageWidth, imageHeight);
  doc.addImage(tryOnImage, 'JPEG', margin + imageWidth + margin, yPos, imageWidth, imageHeight);
  yPos += imageHeight + 8;
  
  // --- Analysis ---
  addSectionTitle('Análise de Visagismo e Colorimetria');
  addText(`Subtom de Pele: ${report.visagismAndColorimetryAnalysis.skinTone}`, 10, 'normal', margin);
  addText(`Contraste Pessoal: ${report.visagismAndColorimetryAnalysis.contrast}`, 10, 'normal', margin);
  addText(report.visagismAndColorimetryAnalysis.recommendation, 10, 'italic', margin, pageWidth - margin * 2 - 5);
  yPos += 5;
  
  // --- Diagnosis and Products ---
  addSectionTitle('Diagnóstico e Produtos');
  addText('Diagnóstico Inicial:', 11, 'bold', margin);
  addText(report.initialDiagnosis, 10, 'normal', margin + 4);
  yPos += 2;
  addText('Produtos Necessários:', 11, 'bold', margin);
  report.products.forEach(p => addText(`• ${p}`, 10, 'normal', margin + 4));
  yPos += 5;
  
  // --- Technique and Steps ---
  addSectionTitle(`Técnica de Mechas: ${report.mechasTechnique.name}`);
  addText(report.mechasTechnique.description, 10, 'normal', margin);
  yPos += 5;
  
  const steps = report.applicationSteps;
  const stepCategories = [
      { title: 'Preparação', steps: steps.preparation },
      { title: 'Aplicação das Mechas', steps: steps.mechas },
      { title: 'Aplicação da Cor de Base', steps: steps.baseColor },
      { title: 'Tonalização', steps: steps.toning },
      { title: 'Tratamento', steps: steps.treatment },
  ];

  stepCategories.forEach(cat => {
      if (cat.steps && cat.steps.length > 0) {
          addText(cat.title, 11, 'bold', margin);
          cat.steps.forEach(step => addText(`• ${step}`, 10, 'normal', margin + 4));
          yPos += 2;
      }
  });

  // --- Diagrams ---
  addSectionTitle('Diagramas da Técnica');
  const diagramContainer = document.createElement('div');
  diagramContainer.style.position = 'absolute';
  diagramContainer.style.left = '-9999px';
  document.body.appendChild(diagramContainer);

  for (const diagram of report.diagrams) {
    const svgDiv = document.createElement('div');
    svgDiv.style.width = '250px';
    svgDiv.style.height = '250px';
    svgDiv.style.backgroundColor = 'white';
    svgDiv.innerHTML = diagram.svg;
    diagramContainer.appendChild(svgDiv);
    
    const canvas = await html2canvas(svgDiv, { backgroundColor: '#ffffff', scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    diagramContainer.removeChild(svgDiv);

    const diagramHeight = 70;
    const diagramWidth = (canvas.width * diagramHeight) / canvas.height;
    
    checkPageBreak(diagramHeight + 15);
    addText(diagram.title, 11, 'bold', margin);
    doc.addImage(imgData, 'PNG', margin, yPos, diagramWidth, diagramHeight);
    yPos += diagramHeight + 8;
  }
  document.body.removeChild(diagramContainer);

  return doc.output('blob');
}

export async function generateHairstylistPdf(
  reportData: { report: HairstylistReport; simulatedImage: SimulatedTurnaround },
  clientImage: string,
  referenceImage: string
): Promise<Blob> {
  const { report, simulatedImage } = reportData;
  // @ts-ignore
  const { jsPDF } = window.jspdf;
  // @ts-ignore
  const html2canvas = window.html2canvas;

  const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
  const pageHeight = doc.internal.pageSize.height;
  const pageWidth = doc.internal.pageSize.width;
  const margin = 15;
  let yPos = margin;

  // --- Helpers ---
  const checkPageBreak = (heightNeeded: number) => {
    if (yPos + heightNeeded > pageHeight - margin) {
      doc.addPage();
      yPos = margin;
    }
  };
  
  const addText = (text: string | string[], size: number, style: 'bold' | 'normal' | 'italic', x: number, maxWidth?: number) => {
    doc.setFontSize(size);
    doc.setFont('helvetica', style);
    const splitText = doc.splitTextToSize(text, maxWidth || (pageWidth - margin * 2));
    checkPageBreak(splitText.length * size * 0.35 + 2);
    doc.text(splitText, x, yPos);
    yPos += (splitText.length * (size * 0.35)) + 2;
  };
  
  const addSectionTitle = (title: string) => {
    checkPageBreak(15);
    doc.setDrawColor(209, 213, 219); // gray
    doc.setLineWidth(0.2);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 8;
    addText(title, 14, 'bold', margin);
  };

  // --- Header ---
  addText('Análise Hairstylist Visagista', 22, 'bold', margin);
  yPos += 5;

  // --- Images ---
  checkPageBreak(75);
  const imageWidth = (pageWidth - (margin * 4)) / 3;
  const imageHeight = 65;
  addText('Comparativo Visual', 11, 'bold', margin);
  yPos += 2;
  
  if (clientImage) doc.addImage(clientImage, 'JPEG', margin, yPos, imageWidth, imageHeight);
  if (referenceImage) doc.addImage(referenceImage, 'JPEG', margin + imageWidth + margin, yPos, imageWidth, imageHeight);
  if (simulatedImage && simulatedImage.front) {
    doc.addImage(simulatedImage.front, 'JPEG', margin + 2 * (imageWidth + margin), yPos, imageWidth, imageHeight);
  }
  
  // Add labels under images
  doc.setFontSize(8);
  doc.text('Cliente (Antes)', margin + imageWidth/2, yPos + imageHeight + 4, { align: 'center' });
  doc.text('Referência', margin + imageWidth + margin + imageWidth/2, yPos + imageHeight + 4, { align: 'center' });
  doc.text('Simulação (IA)', margin + 2 * (imageWidth + margin) + imageWidth/2, yPos + imageHeight + 4, { align: 'center' });

  yPos += imageHeight + 10;
  
  // --- Verdict ---
  addSectionTitle('Veredito da Análise');
  addText(report.viabilityVerdict, 12, 'bold', margin);
  addText(report.viabilityJustification, 10, 'italic', margin, pageWidth - margin * 2 - 5);
  yPos += 5;

  // --- Recommendations ---
  if (report.adaptationRecommendations && report.adaptationRecommendations.length > 0) {
    addSectionTitle('Recomendações de Adaptação');
    report.adaptationRecommendations.forEach(rec => addText(`• ${rec}`, 10, 'normal', margin + 4));
    yPos += 5;
  }
  
  // --- Cutting Plan ---
  addSectionTitle(`Plano de Corte: ${report.cuttingPlan.styleName}`);
  addText('Passo a Passo:', 11, 'bold', margin);
  report.cuttingPlan.steps.forEach((step, index) => {
      addText(`${index + 1}. ${step}`, 10, 'normal', margin + 4);
  });
  yPos += 5;

  // --- Diagrams ---
  if (report.cuttingPlan.diagrams && report.cuttingPlan.diagrams.length > 0) {
    addSectionTitle('Diagramas Técnicos');
    const diagramContainer = document.createElement('div');
    diagramContainer.style.position = 'absolute';
    diagramContainer.style.left = '-9999px';
    document.body.appendChild(diagramContainer);

    for (const diagram of report.cuttingPlan.diagrams) {
      const svgDiv = document.createElement('div');
      svgDiv.style.width = '250px';
      svgDiv.style.height = '250px';
      svgDiv.style.backgroundColor = '#111827'; // Dark background for high-tech SVGs
      svgDiv.innerHTML = diagram.svg;
      diagramContainer.appendChild(svgDiv);
      
      const canvas = await html2canvas(svgDiv, { backgroundColor: '#111827', scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      diagramContainer.removeChild(svgDiv);

      const diagramHeight = 70;
      const diagramWidth = (canvas.width * diagramHeight) / canvas.height;
      
      checkPageBreak(diagramHeight + 15);
      addText(diagram.title, 11, 'bold', margin);
      doc.addImage(imgData, 'PNG', margin, yPos, diagramWidth, diagramHeight);
      yPos += diagramHeight + 8;
    }
    document.body.removeChild(diagramContainer);
  }

  // --- Home Care ---
  addSectionTitle(`Home Care (${report.homeCare.brand})`);
  addText('Produtos Recomendados:', 11, 'bold', margin);
  report.homeCare.products.forEach(p => {
    addText(`• ${p.name}: ${p.purpose}`, 10, 'normal', margin + 4);
  });
  yPos += 3;
  addText('Guia de Aplicação:', 11, 'bold', margin);
  report.homeCare.applicationGuide.forEach(step => {
    addText(`- ${step}`, 10, 'normal', margin + 4);
  });

  return doc.output('blob');
}


export async function generateVisagism360Pdf(
    report: Visagism360Report,
    clientImage: string
): Promise<Blob> {
    // @ts-ignore
    const { jsPDF } = window.jspdf;
    // @ts-ignore
    const html2canvas = window.html2canvas;

    const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
    });

    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;
    const margin = 15;
    let yPos = margin;

    const checkPageBreak = (heightNeeded: number) => {
        if (yPos + heightNeeded > pageHeight - margin) {
            doc.addPage();
            yPos = margin;
        }
    };

    const addText = (text: string, size: number, style: 'bold' | 'normal' | 'italic', x: number, maxWidth?: number) => {
        doc.setFontSize(size);
        doc.setFont('helvetica', style);
        const splitText = doc.splitTextToSize(text, maxWidth || (pageWidth - margin * 2));
        doc.text(splitText, x, yPos);
        yPos += (splitText.length * (size * 0.35)) + 2; // Return height and move yPos
        return (splitText.length * (size * 0.35)) + 2;
    };
    
    const addSectionTitle = (title: string, color: [number, number, number] = [16, 185, 129]) => {
        checkPageBreak(15);
        doc.setDrawColor(209, 213, 219);
        doc.setLineWidth(0.2);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 8;
        doc.setTextColor(color[0], color[1], color[2]);
        addText(title, 14, 'bold', margin);
        doc.setTextColor(0, 0, 0); // Reset to black
        yPos += 2;
    };

    // --- Header ---
    doc.setDrawColor(147, 51, 234); // Purple for 360
    doc.setLineWidth(1);
    doc.line(margin, yPos - 5, pageWidth - margin, yPos - 5);
    addText('Visagismo 360°', 22, 'bold', margin);
    yPos += 5;

    // --- Image & Face Analysis ---
    checkPageBreak(85);
    const imageWidth = 80;
    const imageHeight = 80;
    if (clientImage) {
        doc.addImage(clientImage, 'JPEG', margin, yPos, imageWidth, imageHeight);
    }
    
    let rightColX = margin + imageWidth + 10;
    let tempY = yPos;
    let tempYPos = yPos; // Save yPos before adding text
    doc.setFontSize(12); doc.setFont('helvetica', 'bold');
    doc.text('Análise Facial', rightColX, tempY + 5);
    tempY += 12;
    doc.setFontSize(10); doc.setFont('helvetica', 'normal');
    doc.text(`Formato: ${report.faceShape}`, rightColX, tempY);
    tempY += 7;
    doc.text(doc.splitTextToSize(report.analysis, pageWidth - rightColX - margin), rightColX, tempY);
    yPos = tempYPos; // Restore yPos
    yPos += imageHeight + 10;

    // --- Colorimetry ---
    addSectionTitle('Colorimetria Pessoal', [219, 39, 119]); // Pink
    addText(`Cartela: ${report.colorimetry.season}`, 12, 'bold', margin);
    addText(report.colorimetry.characteristics, 10, 'normal', margin);
    yPos += 5;
    
    checkPageBreak(25);
    doc.setFontSize(10); doc.setFont('helvetica', 'bold');
    doc.text('Paleta Sugerida:', margin, yPos + 5);
    let paletteX = margin + 35;
    if (report.colorimetry.bestColors) {
        report.colorimetry.bestColors.forEach((color) => {
            const isHex = /^#([0-9A-Fa-f]{3}){1,2}$/.test(color);
            if (!isHex) {
                console.warn(`Invalid color format skipped in PDF: "${color}"`);
                return; // Skip this invalid color
            }

            if (paletteX > pageWidth - margin - 12) {
                yPos += 15;
                paletteX = margin + 35;
            }
            doc.setFillColor(color);
            doc.circle(paletteX, yPos + 3, 6, 'F');
            paletteX += 17;
        });
    }
    yPos += 15;

    // --- Styles ---
    addSectionTitle('Sugestões de Cortes', [147, 51, 234]);
    
    const diagramContainer = document.createElement('div');
    diagramContainer.style.position = 'absolute';
    diagramContainer.style.left = '-9999px';
    document.body.appendChild(diagramContainer);

    for (const style of report.styles) {
        checkPageBreak(60);
        addText(`${style.name}`, 12, 'bold', margin);
        addText(style.description, 10, 'normal', margin);
        yPos += 3;
        
        if (style.technicalDetails) {
            addText('Detalhes Técnicos:', 10, 'bold', margin);
            addText(style.technicalDetails, 10, 'normal', margin);
            yPos += 3;
        }

        if (style.diagrams && style.diagrams.length > 0) {
            yPos += 2;
            addText('Diagramas Técnicos:', 10, 'bold', margin);
            for (const diagram of style.diagrams) {
                const svgDiv = document.createElement('div');
                svgDiv.style.width = '250px';
                svgDiv.style.height = '250px';
                svgDiv.style.backgroundColor = '#111827';
                svgDiv.innerHTML = diagram.svg;
                diagramContainer.appendChild(svgDiv);
                
                const canvas = await html2canvas(svgDiv, { backgroundColor: '#111827', scale: 2 });
                const imgData = canvas.toDataURL('image/png');
                diagramContainer.removeChild(svgDiv);

                const diagramHeight = 70;
                const diagramWidth = (canvas.width * diagramHeight) / canvas.height;
                
                checkPageBreak(diagramHeight + 15);
                addText(diagram.title, 10, 'italic', margin);
                doc.addImage(imgData, 'PNG', margin, yPos, diagramWidth, diagramHeight);
                yPos += diagramHeight + 8;
            }
        }

        if (style.stylingTips) {
            addText('Dicas de Finalização:', 10, 'bold', margin);
            addText(style.stylingTips, 10, 'normal', margin);
            yPos += 3;
        }

        doc.setFillColor(243, 232, 255);
        const reasonLines = doc.splitTextToSize(`Por que funciona: ${style.harmonyPoints.join(' ')}`, pageWidth - margin * 2 - 4);
        const boxHeight = (reasonLines.length * 4) + 6;
        checkPageBreak(boxHeight + 5);
        doc.rect(margin, yPos, pageWidth - margin * 2, boxHeight, 'F');
        doc.setTextColor(88, 28, 135);
        doc.text(reasonLines, margin + 2, yPos + 5);
        doc.setTextColor(0, 0, 0);
        yPos += boxHeight + 8;
    }
    document.body.removeChild(diagramContainer);

    return doc.output('blob');
}

export async function generateBarberPdf(
    report: BarberReport,
    clientImage: string,
    simulatedImage: string
): Promise<Blob> {
    // @ts-ignore
    const { jsPDF } = window.jspdf;

    const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
    });

    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;
    const margin = 15;
    let yPos = margin;

    const checkPageBreak = (heightNeeded: number) => {
        if (yPos + heightNeeded > pageHeight - margin) {
            doc.addPage();
            yPos = margin;
        }
    };

    const addText = (text: string, size: number, style: 'bold' | 'normal' | 'italic', x: number, maxWidth?: number) => {
        doc.setFontSize(size);
        doc.setFont('helvetica', style);
        const splitText = doc.splitTextToSize(text, maxWidth || (pageWidth - margin * 2));
        checkPageBreak(splitText.length * size * 0.35 + 2);
        doc.text(splitText, x, yPos);
        yPos += (splitText.length * (size * 0.35)) + 2;
    };

    // Header
    doc.setDrawColor(37, 99, 235); // Blue
    doc.setLineWidth(1);
    doc.line(margin, yPos - 5, pageWidth - margin, yPos - 5);
    addText('Dossiê Barbeiro Visagista', 22, 'bold', margin);
    yPos += 5;

    // Images
    const imgSize = 70;
    doc.addImage(clientImage, 'JPEG', margin, yPos, imgSize, imgSize);
    doc.addImage(simulatedImage, 'JPEG', margin + imgSize + 10, yPos, imgSize, imgSize);
    yPos += imgSize + 10;

    // Analysis
    addText('Análise Facial Masculina', 14, 'bold', margin);
    addText(`Formato: ${report.faceAnalysis.shape}`, 11, 'normal', margin);
    addText(`Características: ${report.faceAnalysis.features}`, 11, 'normal', margin);
    yPos += 5;

    // Haircut
    checkPageBreak(40);
    addText(`Corte: ${report.haircut.styleName}`, 14, 'bold', margin);
    addText(report.haircut.description, 11, 'normal', margin);
    yPos += 3;
    addText('Passo a Passo Técnico:', 11, 'bold', margin);
    report.haircut.technicalSteps.forEach(step => {
        addText(`- ${step}`, 10, 'normal', margin + 5);
    });

    // Beard
    checkPageBreak(30);
    yPos += 5;
    addText('Barba', 14, 'bold', margin);
    addText(`Recomendação: ${report.beard.recommendation}`, 11, 'normal', margin);
    addText(`Manutenção: ${report.beard.maintenance}`, 11, 'normal', margin);

    return doc.output('blob');
}

export async function generateHairTherapyPdf(
    report: HairTherapyReport,
    clientImage: string,
    simulatedImage: string
): Promise<Blob> {
    // @ts-ignore
    const { jsPDF } = window.jspdf;

    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;
    const margin = 15;
    let yPos = margin;

    // --- Helpers ---
    const checkPageBreak = (heightNeeded: number) => {
        if (yPos + heightNeeded > pageHeight - margin) {
            doc.addPage();
            yPos = margin;
        }
    };

    const addText = (text: string | string[], size: number, style: 'bold' | 'normal' | 'italic', x: number, maxWidth?: number): number => {
        doc.setFontSize(size);
        doc.setFont('helvetica', style);
        const splitText = doc.splitTextToSize(text, maxWidth || (pageWidth - margin * 2));
        const textHeight = (splitText.length * (size * 0.35));
        checkPageBreak(textHeight + 4);
        doc.text(splitText, x, yPos);
        return textHeight + 2;
    };
    
    const addSectionTitle = (title: string, color: [number, number, number] = [0, 100, 90]) => {
      checkPageBreak(15);
      doc.setDrawColor(209, 213, 219);
      doc.setLineWidth(0.2);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 8;
      doc.setTextColor(color[0], color[1], color[2]);
      yPos += addText(title, 14, 'bold', margin);
      doc.setTextColor(0, 0, 0);
      yPos += 2;
    };

    // --- Header ---
    doc.setTextColor(0, 150, 136); // Teal/Cyan
    addText('Dossiê de Terapia Capilar', 22, 'bold', margin);
    doc.setTextColor(0, 0, 0);
    yPos += 5;

    // --- Images ---
    checkPageBreak(75);
    const imgSize = 70;
    doc.addImage(clientImage, 'JPEG', margin, yPos, imgSize, imgSize);
    doc.addImage(simulatedImage, 'JPEG', margin + imgSize + 10, yPos, imgSize, imgSize);
    yPos += imgSize + 10;
    
    // --- User Complaint (Dynamic Height) ---
    if (report.userComplaint) {
        addSectionTitle("Relato do Cliente", [88, 28, 135]);
        yPos += addText(report.userComplaint, 10, 'italic', margin, pageWidth - margin * 2);
        yPos += 5;
    }

    // --- Diagnosis (Dynamic) ---
    addSectionTitle("Diagnóstico do Fio");
    yPos += addText(`Nível de Dano: ${report.diagnosis.damageLevel}`, 10, 'normal', margin);
    yPos += addText(`Porosidade: ${report.diagnosis.porosity}`, 10, 'normal', margin);
    yPos += addText(`Elasticidade: ${report.diagnosis.elasticity}`, 10, 'normal', margin);
    yPos += 3;
    yPos += addText('Análise Visual:', 10, 'bold', margin);
    yPos += addText(report.diagnosis.visualAnalysis, 10, 'italic', margin, pageWidth - margin * 2 - 5);
    yPos += 5;

    // --- Strategy ---
    addSectionTitle("Estratégia de Tratamento");
    yPos += addText(report.treatmentStrategy.focus, 12, 'bold', margin);
    yPos += addText(report.treatmentStrategy.explanation, 10, 'normal', margin);
    yPos += 5;

    // --- Products ---
    addSectionTitle("Produtos Prescritos");
    report.recommendedProducts.forEach(prod => {
        checkPageBreak(20);
        yPos += addText(`• ${prod.name}`, 11, 'bold', margin);
        yPos += addText(`  ${prod.category} | ${prod.usageFrequency}`, 9, 'normal', margin);
        yPos += addText(`  Motivo: ${prod.reason}`, 9, 'italic', margin + 2, pageWidth - margin*2 - 8);
        yPos += 4;
    });
    yPos += 5;

    // --- Schedule (Vertical Layout) ---
    addSectionTitle("Cronograma Capilar (4 Semanas)");
    report.hairSchedule.forEach(week => {
        checkPageBreak(25);
        yPos += addText(`Semana ${week.week}`, 11, 'bold', margin);
        yPos += addText(`- Lavagem 1: ${week.treatment1}`, 10, 'normal', margin + 5);
        yPos += addText(`- Lavagem 2: ${week.treatment2}`, 10, 'normal', margin + 5);
        yPos += addText(`- Lavagem 3: ${week.treatment3}`, 10, 'normal', margin + 5);
        yPos += 6;
    });

    return doc.output('blob');
}