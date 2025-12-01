import React, { useState, useRef, useEffect } from 'react';
import type { CuttingPlan } from '../types';
import { Icon } from './Icon';
import { ZoomableImage } from './ZoomableImage';

interface CuttingPlanDisplayProps {
  plan: CuttingPlan;
  referenceImage: string | null;
  realisticImage: string | null;
  videoUrl: string | null;
}

interface Annotation {
  id: number;
  time: number;
  text: string;
}

type Tab = 'plan' | 'visagism' | 'diagrams' | 'result' | 'transformation' | 'video' | '3d';

export const CuttingPlanDisplay: React.FC<CuttingPlanDisplayProps> = ({ plan, referenceImage, realisticImage, videoUrl }) => {
  const [activeTab, setActiveTab] = useState<Tab>('plan');
  const [highlightedStep, setHighlightedStep] = useState<number | null>(null);
  const diagramsContainerRef = useRef<HTMLDivElement>(null);
  
  // Video Annotation State
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [newAnnotationText, setNewAnnotationText] = useState('');
  const [activeAnnotation, setActiveAnnotation] = useState<Annotation | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const annotationInputRef = useRef<HTMLInputElement>(null);
  
  // 3D View State
  const [rotation, setRotation] = useState({ x: -15, y: 30 });
  const [zoom3D, setZoom3D] = useState(1);
  const [isDragging3D, setIsDragging3D] = useState(false);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const threeDContainerRef = useRef<HTMLDivElement>(null);
  const [isInteracting3D, setIsInteracting3D] = useState(false);
  const interactionTimeoutRef = useRef<number | null>(null);
  const [activeTooltip, setActiveTooltip] = useState<{ step: number; content: string; x: number; y: number } | null>(null);

  // Transformation Animation State
  const [animationState, setAnimationState] = useState<'idle' | 'playing' | 'paused'>('idle');
  const [animationProgress, setAnimationProgress] = useState(0);
  const animationIntervalRef = useRef<number | null>(null);


  useEffect(() => {
    const container2D = diagramsContainerRef.current;
    const container3D = threeDContainerRef.current;

    // Clear highlights from both containers
    container2D?.querySelectorAll('.highlight').forEach(el => el.classList.remove('highlight'));
    container3D?.querySelectorAll('.highlight').forEach(el => el.classList.remove('highlight'));

    if (highlightedStep !== null) {
        if (activeTab === 'diagrams' && container2D) {
            const elementToHighlight = container2D.querySelector(`#step-${highlightedStep}`);
            elementToHighlight?.classList.add('highlight');
        } else if (activeTab === '3d' && container3D) {
            const elementsToHighlight = container3D.querySelectorAll(`[id='step-${highlightedStep}']`);
            elementsToHighlight.forEach(el => el.classList.add('highlight'));
        }
    }
  }, [highlightedStep, plan.diagrams, activeTab]);

  const setupInteractiveListeners = (container: HTMLElement | null) => {
    if (!container) return;

    const interactiveElements = container.querySelectorAll('[id^="step-"]');
    
    const handleMouseOver = (e: Event) => {
        const target = e.currentTarget as HTMLElement;
        const stepId = parseInt(target.id.replace('step-', ''), 10);
        if (isNaN(stepId)) return;
        
        setHighlightedStep(stepId);

        const stepIndex = stepId - 1;
        if (plan.steps[stepIndex]) {
            const rect = target.getBoundingClientRect();
            setActiveTooltip({
                step: stepId,
                content: `Passo ${stepId}: ${plan.steps[stepIndex]}`,
                x: rect.left + rect.width / 2,
                y: rect.top - 10,
            });
        }
    };
    
    const handleMouseOut = () => {
        setHighlightedStep(null);
        setActiveTooltip(null);
    };

    interactiveElements.forEach(el => {
        el.addEventListener('mouseover', handleMouseOver);
        el.addEventListener('mouseout', handleMouseOut);
    });

    return () => {
        interactiveElements.forEach(el => {
            el.removeEventListener('mouseover', handleMouseOver);
            el.removeEventListener('mouseout', handleMouseOut);
        });
    };
  };
  
  useEffect(() => {
    if (activeTab === 'diagrams') {
        return setupInteractiveListeners(diagramsContainerRef.current);
    }
    if (activeTab === '3d') {
        // Debounce setup to allow for 3D elements to render
        const timeoutId = setTimeout(() => {
            setupInteractiveListeners(threeDContainerRef.current);
        }, 100);
        return () => clearTimeout(timeoutId);
    }
  }, [plan.diagrams, activeTab, threeDContainerRef.current, diagramsContainerRef.current]);

  // Video Annotation Handlers
  const handleAddAnnotation = () => {
    if (newAnnotationText.trim() && videoRef.current) {
      const newAnnotation: Annotation = {
        id: Date.now(),
        time: videoRef.current.currentTime,
        text: newAnnotationText.trim(),
      };
      setAnnotations(prev => [...prev, newAnnotation].sort((a, b) => a.time - b.time));
      setNewAnnotationText('');
      annotationInputRef.current?.focus();
    }
  };

  const handleDeleteAnnotation = (id: number) => {
    setAnnotations(prev => prev.filter(a => a.id !== id));
  };

  const handleSeekToAnnotation = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      videoRef.current.play();
    }
  };

  // Effect for video time updates to show annotations
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const currentTime = video.currentTime;
      const currentAnnotation = annotations.find(
        (a) => currentTime >= a.time && currentTime < a.time + 4 // Show for 4 seconds
      );
      // Avoid re-rendering if the active annotation is the same
      setActiveAnnotation(prev => (prev?.id === currentAnnotation?.id ? prev : currentAnnotation || null));
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [annotations, videoUrl]);


  const handleDownloadSvg = (svgContent: string, title: string) => {
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, '-')}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  // 3D View Handlers
  const MIN_ZOOM_3D = 0.5;
  const MAX_ZOOM_3D = 2.0;

  const trigger3DInteraction = () => {
    setIsInteracting3D(true);
    if (interactionTimeoutRef.current) {
        clearTimeout(interactionTimeoutRef.current);
    }
    interactionTimeoutRef.current = window.setTimeout(() => {
        setIsInteracting3D(false);
    }, 400); // Keep glow for 400ms after interaction stops
  };

  const handleMouseDown3D = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging3D(true);
    lastMousePos.current = { x: e.clientX, y: e.clientY };
    trigger3DInteraction();
  };

  const handleMouseMove3D = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging3D) return;
    const deltaX = e.clientX - lastMousePos.current.x;
    const deltaY = e.clientY - lastMousePos.current.y;

    setRotation({
      y: rotation.y + deltaX * 0.5,
      x: rotation.x - deltaY * 0.5
    });

    lastMousePos.current = { x: e.clientX, y: e.clientY };
    trigger3DInteraction();
  };

  const handleMouseUp3D = () => {
    setIsDragging3D(false);
  };

  const handleTouchStart3D = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1) {
        setIsDragging3D(true);
        lastMousePos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        trigger3DInteraction();
    }
  };

  const handleTouchMove3D = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging3D || e.touches.length !== 1) return;
    
    // Prevent scrolling while rotating
    e.preventDefault();
    
    const deltaX = e.touches[0].clientX - lastMousePos.current.x;
    const deltaY = e.touches[0].clientY - lastMousePos.current.y;

    setRotation({
      y: rotation.y + deltaX * 0.5,
      x: rotation.x - deltaY * 0.5
    });

    lastMousePos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    trigger3DInteraction();
  };
  
  const handleTouchEnd3D = () => {
    setIsDragging3D(false);
  };

  const handleRotate = (axis: 'x' | 'y', angle: number) => {
    if (isDragging3D) return;
    setRotation(prev => ({
      ...prev,
      [axis]: prev[axis] + angle
    }));
    trigger3DInteraction();
  };
  
  const handleZoom3D = (factor: number) => {
    if (isDragging3D) return;
    setZoom3D(prev => Math.max(MIN_ZOOM_3D, Math.min(MAX_ZOOM_3D, prev * factor)));
    trigger3DInteraction();
  };

  const handleReset3DView = () => {
    if (isDragging3D) return;
    setRotation({ x: -15, y: 30 });
    setZoom3D(1);
  };
  
  const handleWheel3D = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const ZOOM_SENSITIVITY_3D = 0.002;
    setZoom3D(prev => {
        const newZoom = prev - e.deltaY * ZOOM_SENSITIVITY_3D;
        return Math.max(MIN_ZOOM_3D, Math.min(MAX_ZOOM_3D, newZoom));
    });
    trigger3DInteraction();
  };

  // Transformation Animation Handlers
  const handlePlayPauseAnimation = () => {
    if (animationState === 'playing') {
      setAnimationState('paused');
    } else {
      // If finished, restart on play
      if (animationProgress >= 100) {
        setAnimationProgress(0);
      }
      setAnimationState('playing');
    }
  };

  const handleRestartAnimation = () => {
    setAnimationProgress(0);
    setAnimationState('playing');
  };
  
  const handleTimelineClick = (stepIndex: number) => {
      const stepCount = plan.steps.length;
      const progress = (stepIndex / (stepCount - 1)) * 100;
      setAnimationProgress(progress);
      if (animationState === 'idle' || animationState === 'paused') {
          setAnimationState('paused'); // Stay paused when clicking
      }
  };

  // Effect for Transformation Animation
  useEffect(() => {
    if (animationState === 'playing') {
      animationIntervalRef.current = window.setInterval(() => {
        setAnimationProgress(prev => {
          if (prev >= 100) {
            clearInterval(animationIntervalRef.current!);
            setAnimationState('idle');
            return 100;
          }
          return prev + 1; // Animation speed controller
        });
      }, 50); 
    } else {
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
      }
    }
    return () => {
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
      }
    };
  }, [animationState]);


  const renderContent = () => {
    switch (activeTab) {
      case 'plan':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-emerald-300 mb-2">Ferramentas Necessárias</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-300">
                {plan.tools.map((tool, index) => <li key={index}>{tool}</li>)}
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-emerald-300 mb-2">Passo a Passo</h3>
              <ol className="list-decimal list-inside space-y-1 text-gray-300">
                {plan.steps.map((step, index) => (
                    <li 
                        key={index}
                        onMouseEnter={() => setHighlightedStep(index + 1)}
                        onMouseLeave={() => setHighlightedStep(null)}
                        className={`p-2 rounded-md transition-colors duration-200 ${highlightedStep === index + 1 ? 'bg-emerald-500/20' : ''}`}
                    >
                        {step}
                    </li>
                ))}
              </ol>
            </div>
          </div>
        );
      case 'visagism':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-emerald-300 mb-2 flex items-center gap-2">
              <Icon name="face" className="w-6 h-6" />
              Análise de Visagismo
            </h3>
            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{plan.visagismAnalysis}</p>
          </div>
        );
      case 'diagrams':
        return (
          <>
            <div ref={diagramsContainerRef} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {plan.diagrams.map((diagram, index) => (
                <div key={index} className="group relative bg-gray-700/50 p-4 rounded-lg flex flex-col items-center">
                   <button 
                    onClick={() => handleDownloadSvg(diagram.svg, diagram.title)}
                    className="absolute top-2 right-2 p-2 bg-gray-800/50 rounded-full text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-emerald-600 hover:text-white"
                    title="Baixar SVG"
                  >
                    <Icon name="download" className="w-5 h-5" />
                  </button>
                  <h4 className="font-semibold mb-2 text-gray-200">{diagram.title}</h4>
                  <div className="bg-white rounded p-2 w-full aspect-square" dangerouslySetInnerHTML={{ __html: diagram.svg }} />
                </div>
              ))}
            </div>
          </>
        );
      case 'result':
        return (
          <div className="flex flex-col md:flex-row gap-4 items-start">
            <div className="flex-1 text-center w-full">
              <h4 className="font-semibold mb-2">Imagem de Referência</h4>
              {referenceImage ? (
                  <ZoomableImage src={referenceImage.startsWith('data:') ? referenceImage : `data:image/png;base64,${referenceImage}`} alt="Reference" />
              ) : (
                <div className="w-full h-80 bg-gray-700 rounded-lg flex items-center justify-center">Carregando...</div>
              )}
            </div>
            <div className="flex-1 text-center w-full">
              <h4 className="font-semibold mb-2">Resultado Realista (IA)</h4>
              {realisticImage ? (
                <ZoomableImage src={realisticImage} alt="Realistic Result" />
              ) : (
                 <div className="w-full h-80 bg-gray-700 rounded-lg flex items-center justify-center">Gerando imagem...</div>
              )}
            </div>
          </div>
        );
      case 'transformation': {
        const stepCount = plan.steps.length;
        const stepDuration = 100 / stepCount;
        const currentStepIndex = Math.min(Math.floor(animationProgress / stepDuration), stepCount - 1);
        const currentStepText = plan.steps[currentStepIndex];
    
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
                <div className="relative w-full max-w-lg aspect-square mb-6 bg-gray-700 rounded-lg overflow-hidden">
                    {referenceImage && (
                        <img 
                            src={referenceImage.startsWith('data:') ? referenceImage : `data:image/png;base64,${referenceImage}`} 
                            alt="Reference"
                            className="absolute inset-0 w-full h-full object-contain"
                        />
                    )}
                    {realisticImage && (
                        <img 
                            src={realisticImage} 
                            alt="Realistic Result"
                            className="absolute inset-0 w-full h-full object-contain transition-opacity duration-500"
                            style={{ opacity: animationProgress / 100 }}
                        />
                    )}
                    {animationState !== 'idle' && animationProgress < 100 && (
                        <div className="absolute bottom-4 left-4 right-4 bg-black/60 text-white p-3 rounded-lg text-center backdrop-blur-sm animate-fadeInOut">
                            <p className="font-semibold text-emerald-300">Passo {currentStepIndex + 1}</p>
                            <p>{currentStepText}</p>
                        </div>
                    )}
                </div>
                <div className="w-full max-w-lg">
                    {/* Timeline */}
                    <div className="relative w-full h-5 mb-2 px-2">
                        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-600 rounded-full -translate-y-1/2">
                            <div 
                                className="absolute top-0 left-0 h-full bg-emerald-500 rounded-full"
                                style={{ width: `${animationProgress}%`}}
                            ></div>
                        </div>
                        <div className="relative flex justify-between items-center w-full h-full">
                            {plan.steps.map((step, index) => (
                                <div key={index} className="relative flex flex-col items-center group">
                                    <button
                                        onClick={() => handleTimelineClick(index)}
                                        className={`w-4 h-4 rounded-full transition-colors duration-200 ${animationProgress >= (index / (stepCount - 1)) * 100 ? 'bg-emerald-500' : 'bg-gray-400'}`}
                                        style={{ zIndex: 1 }}
                                    ></button>
                                     <div className="absolute bottom-full mb-2 w-max max-w-xs p-2 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none transform -translate-x-1/2 left-1/2">
                                        Passo {index + 1}: {step}
                                     </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-center items-center gap-4 mt-4">
                        <button onClick={handlePlayPauseAnimation} className="px-4 py-2 bg-emerald-600 text-white rounded-md font-medium hover:bg-emerald-500 transition-colors w-28 text-center">
                            {animationState === 'playing' ? 'Pausar' : (animationProgress >= 100 ? 'Rever' : 'Iniciar')}
                        </button>
                        <button onClick={handleRestartAnimation} disabled={animationState === 'idle' && animationProgress === 0} className="px-4 py-2 bg-gray-600 text-white rounded-md font-medium hover:bg-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            Reiniciar
                        </button>
                    </div>
                </div>
            </div>
        );
      }
      case 'video':
        return (
            <div className="flex flex-col items-center">
                <h3 className="text-xl font-semibold text-emerald-300 mb-4">Animação com Anotações</h3>
                {videoUrl ? (
                    <div className="w-full max-w-2xl">
                        <div className="relative">
                            <video ref={videoRef} src={videoUrl} controls autoPlay loop className="rounded-lg w-full"></video>
                             {activeAnnotation && (
                                <div
                                key={activeAnnotation.id}
                                className="absolute bottom-12 sm:bottom-16 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-lg text-center pointer-events-none animate-fadeInOut"
                                >
                                {activeAnnotation.text}
                                </div>
                            )}
                        </div>
                         <div className="mt-6 space-y-4">
                            <div>
                                <div className="flex gap-2">
                                <input
                                    ref={annotationInputRef}
                                    type="text"
                                    value={newAnnotationText}
                                    onChange={(e) => setNewAnnotationText(e.target.value)}
                                    placeholder="Adicionar anotação no tempo atual..."
                                    className="flex-grow bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    onKeyPress={(e) => { if (e.key === 'Enter') handleAddAnnotation(); }}
                                />
                                <button onClick={handleAddAnnotation} className="px-4 py-2 bg-emerald-600 text-white rounded-md font-medium hover:bg-emerald-500 transition-colors disabled:bg-gray-500" disabled={!newAnnotationText.trim()}>
                                    Adicionar
                                </button>
                                </div>
                            </div>
                            
                            {annotations.length > 0 && (
                                <div className="space-y-2 max-h-48 overflow-y-auto pr-2 bg-gray-900/30 p-2 rounded-md">
                                {annotations.map(ann => (
                                    <div key={ann.id} className="flex justify-between items-center bg-gray-700/50 p-2 rounded-md group">
                                    <button onClick={() => handleSeekToAnnotation(ann.time)} className="text-left flex-grow cursor-pointer group-hover:text-emerald-300 transition-colors flex items-center">
                                        <span className="font-mono text-sm bg-gray-900/50 px-2 py-1 rounded">{new Date(ann.time * 1000).toISOString().substr(14, 5)}</span>
                                        <span className="ml-3 text-gray-300 group-hover:text-white truncate">{ann.text}</span>
                                    </button>
                                    <button onClick={() => handleDeleteAnnotation(ann.id)} className="p-1 text-gray-500 hover:text-red-400 opacity-50 group-hover:opacity-100 transition-all" title="Excluir anotação">
                                        <Icon name="trash" className="w-4 h-4" />
                                    </button>
                                    </div>
                                ))}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="w-full max-w-2xl aspect-video bg-gray-700 rounded-lg flex items-center justify-center">
                        <p>Nenhum vídeo gerado ainda.</p>
                    </div>
                )}
            </div>
        );
       case '3d':
        const diagramAngles = [0, 90]; // Angles for 2 diagrams
        const radius = 150; // in px
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
                {activeTooltip && (
                    <div
                        className="fixed z-20 p-2 text-sm text-white bg-gray-900/80 rounded-md shadow-lg pointer-events-none transition-opacity duration-200"
                        style={{
                            left: activeTooltip.x,
                            top: activeTooltip.y,
                            transform: 'translate(-50%, -100%)',
                            opacity: highlightedStep === activeTooltip.step ? 1 : 0,
                        }}
                    >
                        {activeTooltip.content}
                    </div>
                )}
                <div 
                    className="relative w-full h-full cursor-grab active:cursor-grabbing"
                    style={{ perspective: '1200px' }}
                    onMouseDown={handleMouseDown3D}
                    onMouseMove={handleMouseMove3D}
                    onMouseUp={handleMouseUp3D}
                    onMouseLeave={handleMouseUp3D}
                    onWheel={handleWheel3D}
                    onTouchStart={handleTouchStart3D}
                    onTouchMove={handleTouchMove3D}
                    onTouchEnd={handleTouchEnd3D}
                    onTouchCancel={handleTouchEnd3D}
                >
                    <div 
                        ref={threeDContainerRef}
                        className="relative w-full h-full"
                        style={{
                            transformStyle: 'preserve-3d',
                            transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(${zoom3D})`,
                            transition: isDragging3D ? 'none' : 'transform 0.5s ease-out'
                        }}
                    >
                        {plan.diagrams.map((diagram, index) => (
                            <div
                                key={index}
                                className={`absolute w-[300px] h-[300px] bg-white/95 rounded-lg p-2 select-none transition-shadow duration-300 ease-in-out ${isInteracting3D ? 'shadow-emerald-400/50 shadow-2xl' : 'shadow-lg'}`}
                                style={{
                                    transform: `rotateY(${diagramAngles[index]}deg) translateZ(${radius}px)`,
                                    top: '50%',
                                    left: '50%',
                                    marginTop: '-150px',
                                    marginLeft: '-150px',
                                }}
                            >
                                 <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: diagram.svg }} />
                            </div>
                        ))}
                    </div>
                     <div className="absolute bottom-4 right-4 flex flex-col items-end gap-2 z-10">
                        {/* --- Rotation Controls --- */}
                        <div className="bg-gray-900/50 p-2 rounded-lg backdrop-blur-sm flex items-center gap-1">
                            <button onClick={() => handleRotate('y', 15)} className="p-2 text-white hover:bg-gray-700/80 rounded-md" title="Girar para Esquerda">
                                <Icon name="arrow-left" className="w-5 h-5"/>
                            </button>
                            <div className="flex flex-col gap-1">
                                <button onClick={() => handleRotate('x', -15)} className="p-2 text-white hover:bg-gray-700/80 rounded-md" title="Girar para Cima">
                                    <Icon name="arrow-up" className="w-5 h-5"/>
                                </button>
                                <button onClick={() => handleRotate('x', 15)} className="p-2 text-white hover:bg-gray-700/80 rounded-md" title="Girar para Baixo">
                                    <Icon name="arrow-down" className="w-5 h-5"/>
                                </button>
                            </div>
                            <button onClick={() => handleRotate('y', -15)} className="p-2 text-white hover:bg-gray-700/80 rounded-md" title="Girar para Direita">
                                <Icon name="arrow-right" className="w-5 h-5"/>
                            </button>
                        </div>
                        {/* --- Zoom & Reset Controls --- */}
                        <div className="bg-gray-900/50 p-2 rounded-lg backdrop-blur-sm flex items-center gap-1">
                            <button onClick={() => handleZoom3D(1.2)} className="p-2 text-white hover:bg-gray-700/80 rounded-md" title="Aumentar Zoom">
                                <Icon name="zoom-in" className="w-5 h-5"/>
                            </button>
                            <button onClick={() => handleZoom3D(0.8)} className="p-2 text-white hover:bg-gray-700/80 rounded-md" title="Diminuir Zoom">
                                <Icon name="zoom-out" className="w-5 h-5"/>
                            </button>
                            <div className="w-px h-10 bg-gray-600 mx-1"></div>
                            <button onClick={handleReset3DView} className="p-2 text-white hover:bg-gray-700/80 rounded-md" title="Resetar Visualização">
                                <Icon name="refresh" className="w-5 h-5"/>
                            </button>
                        </div>
                    </div>
                </div>
                <p className="mt-4 text-sm text-gray-400">Clique e arraste para girar. Passe o mouse sobre os elementos para ver detalhes.</p>
            </div>
        );
    }
  };
  
  const TabButton = ({ tabId, iconName, label }: { tabId: Tab, iconName: string, label: string }) => (
    <button
      id={`tab-${tabId}`}
      onClick={() => setActiveTab(tabId)}
      className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
        activeTab === tabId ? 'bg-emerald-600 text-white' : 'text-gray-300 hover:bg-gray-700'
      }`}
    >
      <Icon name={iconName} className="w-5 h-5" />
      {label}
    </button>
  );

  return (
    <div id="cutting-plan-display" className="bg-gray-800 rounded-2xl p-6 h-full flex flex-col">
      <div className="flex-shrink-0">
        <h2 className="text-2xl font-bold mb-1 text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-green-400">{plan.styleName}</h2>
        <p className="text-gray-400 mb-4">{plan.description}</p>
        <div className="flex space-x-2 border-b border-gray-700 pb-4 mb-4 overflow-x-auto">
          <TabButton tabId="plan" iconName="list" label="Plano de Corte" />
          <TabButton tabId="visagism" iconName="face" label="Análise Facial" />
          <TabButton tabId="diagrams" iconName="diagram" label="Diagramas" />
          <TabButton tabId="result" iconName="image" label="Resultado" />
          <TabButton tabId="transformation" iconName="magic" label="Transformação" />
          <TabButton tabId="3d" iconName="cube" label="Visualização 3D" />
          {videoUrl && <TabButton tabId="video" iconName="video" label="Animação" />}
        </div>
      </div>
      <div className="flex-grow overflow-y-auto pr-2">
        {renderContent()}
      </div>
    </div>
  );
};
