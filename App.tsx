import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { ImageInput } from "./components/ImageInput";
import { CuttingPlanDisplay } from "./components/CuttingPlanDisplay";
import { ChatPanel } from "./components/ChatPanel";
import { ActionButtons } from "./components/ActionButtons";
import { LoadingOverlay } from "./components/LoadingOverlay";
import { Icon } from "./components/Icon";
import { VisagismReportDisplay } from "./components/VisagismReportDisplay";
import { ColoristReportDisplay } from "./components/ColoristReportDisplay";
import { HairstylistReportDisplay } from "./components/HairstylistReportDisplay";
import { Visagism360Display } from "./components/Visagism360Display";
import { BarberReportDisplay } from "./components/BarberReportDisplay";
import { HairTherapyReportDisplay } from "./components/HairTherapyReportDisplay";
import { TutorialOverlay } from "./components/TutorialOverlay";
import { SavedPlansModal } from "./components/SavedPlansModal";
import { PaymentModal } from "./components/PaymentModal";
import { CatalogModal } from "./components/CatalogModal";
import { AuthScreen, AppUser } from "./components/AuthScreen"; // Import AuthScreen
import { auth, db } from "./firebase";
import { signOut } from "firebase/auth";
import { doc, updateDoc, serverTimestamp, onSnapshot } from "firebase/firestore";

import {
  analyzeHaircutImage,
  conductVisagismAnalysis,
  generateRealisticImage,
  editImageWithText,
  generateColoristReport,
  generateVideoFromImage,
  textToSpeech,
  findNearbyStores,
  getHairDescriptionFromImage,
  generateHairstylistReport,
  generateVisagism360Report,
  generateBarberReport,
  generateHairTherapyReport,
} from "./services/geminiService";
import { fileToBase64, dataURLtoFile } from "./utils/fileUtils";
import type {
  CuttingPlan,
  VisagismReport,
  ColoristReport,
  SavedPlan,
  HairstylistReport,
  Visagism360Report,
  BarberReport,
  SimulatedTurnaround,
  HairTherapyReport,
} from "./types";
import { ImageUploader } from "./components/ImageUploader";

export default function App() {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);

  // Função para verificar se o usuário tem acesso válido (trial ou assinatura ativa)
  const evaluateAccess = (user: AppUser | null) => {
    if (!user) return false;
    const now = Date.now();
    
    // Verifica se tem assinatura ativa (30 dias)
    const hasActiveSubscription =
      user.subscriptionStatus === "active" &&
      typeof user.accessUntil === "number" &&
      user.accessUntil > now;

    // Verifica se está no período de trial (2 dias)
    const isInTrial =
      user.subscriptionStatus === "trial" &&
      typeof user.trialEndsAt === "number" &&
      user.trialEndsAt > now;

    return hasActiveSubscription || isInTrial;
  };

  // Check for session on mount
  useEffect(() => {
    const stored = localStorage.getItem("appUser");
    if (stored) {
      try {
        const parsed: AppUser = JSON.parse(stored);
        setCurrentUser(parsed);
        setIsAuthenticated(true);
        
        // Verifica se o acesso expirou ao carregar
        const allowed = evaluateAccess(parsed);
        if (!allowed) {
          setIsPaymentModalOpen(true);
        }
      } catch {
        localStorage.removeItem("appUser");
      }
    }
  }, []);

  // Listener do Firestore para monitorar expiração em tempo real
  useEffect(() => {
    if (!currentUser?.uid) return;

    const userRef = doc(db, 'users', currentUser.uid);
    
    const unsubscribe = onSnapshot(
      userRef,
      (snapshot) => {
        if (!snapshot.exists()) return;

        const data = snapshot.data();
        const updatedUser: AppUser = {
          uid: currentUser.uid,
          email: data.email || currentUser.email,
          fullName: data.fullName || currentUser.fullName,
          subscriptionStatus: data.subscriptionStatus,
          trialEndsAt: data.trialEndsAt,
          accessUntil: data.accessUntil,
          paymentId: data.paymentId,
        };

        // Atualiza o usuário no estado
        setCurrentUser(updatedUser);
        localStorage.setItem("appUser", JSON.stringify(updatedUser));

        // Verifica se o acesso expirou (trial de 2 dias OU assinatura de 30 dias)
        const allowed = evaluateAccess(updatedUser);
        if (!allowed) {
          // Se expirou, abre o modal de pagamento
          setIsPaymentModalOpen(true);
        } else {
          // Se tem acesso válido, fecha o modal se estiver aberto
          setIsPaymentModalOpen(false);
        }
      },
      (error) => {
        console.error('Erro ao escutar atualizações do Firestore:', error);
      }
    );

    return () => unsubscribe();
  }, [currentUser?.uid]);

  const handleLogin = (user: AppUser) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem("appUser", JSON.stringify(user));

    const allowed = evaluateAccess(user);
    if (!allowed) {
      setIsPaymentModalOpen(true);
    }
  };

  const handleSubscriptionUpdated = (updatedUser: AppUser) => {
    setCurrentUser(updatedUser);
    localStorage.setItem("appUser", JSON.stringify(updatedUser));
    // O modal fecha automaticamente após a atualização
  };

  const handleLogout = () => {
    localStorage.removeItem("appUser");
    setIsAuthenticated(false);
    setIsAdmin(false);
    setCurrentUser(null);
    signOut(auth).catch((err) =>
      console.error("Erro ao sair do Firebase", err)
    );
    // Reset critical states
    setActiveTab("hairstylist");
    setHairstylistReport(null);
    setVisagism360Report(null);
    setColoristReport(null);
    setBarberReport(null);
    setTherapyReport(null);
  };

  const [activeTab, setActiveTab] = useState<
    "hairstylist" | "visagism360" | "colorist" | "barber" | "therapy"
  >("hairstylist");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  // Legacy Analyze Mode State (for saved plans)
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [cuttingPlan, setCuttingPlan] = useState<CuttingPlan | null>(null);
  const [visagismReport, setVisagismReport] = useState<VisagismReport | null>(
    null
  );
  const [realisticImage, setRealisticImage] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  // Hairstylist Visagista Mode State
  const [clientPhoto, setClientPhoto] = useState<File | null>(null);
  const [referencePhoto, setReferencePhoto] = useState<File | null>(null);
  const [hairstylistDescription, setHairstylistDescription] = useState("");
  const [homeCareBrand, setHomeCareBrand] = useState("Wella Professionals");
  const [hairstylistReport, setHairstylistReport] = useState<{
    report: HairstylistReport;
    simulatedImage: SimulatedTurnaround;
  } | null>(null);

  // Colorist Mode State
  const [clientImageForColor, setClientImageForColor] = useState<File | null>(
    null
  );
  const [coloristReferencePhoto, setColoristReferencePhoto] =
    useState<File | null>(null);
  const [coloristDescription, setColoristDescription] = useState("");
  const [cosmeticsBrand, setCosmeticsBrand] = useState("Wella Professionals");
  const [coloristReport, setColoristReport] = useState<{
    report: ColoristReport;
    tryOnImage: SimulatedTurnaround;
  } | null>(null);

  // Visagism 360 Mode State
  const [visagism360Image, setVisagism360Image] = useState<File | null>(null);
  const [visagism360Report, setVisagism360Report] =
    useState<Visagism360Report | null>(null);

  // Barber Mode State
  const [barberClientPhoto, setBarberClientPhoto] = useState<File | null>(null);
  const [barberReferencePhoto, setBarberReferencePhoto] = useState<File | null>(
    null
  );
  const [barberDescription, setBarberDescription] = useState("");
  const [barberReport, setBarberReport] = useState<{
    report: BarberReport;
    simulatedImage: SimulatedTurnaround;
  } | null>(null);

  // Hair Therapy Mode State
  const [therapyClientPhoto, setTherapyClientPhoto] = useState<File | null>(
    null
  );
  const [therapyBrand, setTherapyBrand] = useState("Kérastase");
  const [therapyDescription, setTherapyDescription] = useState("");
  const [therapyReport, setTherapyReport] = useState<{
    report: HairTherapyReport;
    simulatedImage: SimulatedTurnaround;
  } | null>(null);

  // Modals & Overlays
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [tutorialType, setTutorialType] = useState<
    "analyze" | "color-expert" | "visagism-360" | "barber" | "therapy" | null
  >(null);
  const [isSavedPlansOpen, setIsSavedPlansOpen] = useState(false);
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [shareMessage, setShareMessage] = useState<string | null>(null);

  // Function to handle image downloads
  const handleDownloadImage = (imageUrl: string, quality: number) => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = "imagem-gerada.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Function to handle image sharing
  const handleShareOrCopyImage = async (imageUrl: string, quality?: number) => {
    try {
      const blob = await (await fetch(imageUrl)).blob();
      const file = new File([blob], "image.png", { type: blob.type });
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Resultado Simulado",
          text: "Veja este resultado incrível!",
        });
      } else {
        try {
          await navigator.clipboard.write([
            new ClipboardItem({
              [blob.type]: blob,
            }),
          ]);
          setShareMessage("Imagem copiada para a área de transferência!");
        } catch (e) {
          setShareMessage("Não foi possível compartilhar ou copiar.");
        }
      }
    } catch (error) {
      console.error("Share failed", error);
    }
    setTimeout(() => setShareMessage(null), 3000);
  };

  const handleGenerateHairstylistReport = async () => {
    // Allows generation if client photo exists AND (reference photo OR text description exists)
    if (!clientPhoto || (!referencePhoto && !hairstylistDescription.trim()))
      return;
    setIsLoading(true);
    setLoadingMessage("Analisando, simulando resultado e gerando relatório...");
    try {
      const result = await generateHairstylistReport(
        clientPhoto,
        referencePhoto,
        homeCareBrand,
        hairstylistDescription
      );
      setHairstylistReport(result);
    } catch (error) {
      console.error(error);
      alert("Erro ao gerar o relatório de visagismo.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateVisagism360 = async () => {
    if (!visagism360Image) return;
    setIsLoading(true);
    setLoadingMessage("Gerando análise, diagramas e simulações de imagem...");
    try {
      const result = await generateVisagism360Report(visagism360Image);
      setVisagism360Report(result);
    } catch (error) {
      console.error(error);
      alert("Erro ao gerar análise 360°.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateBarber = async () => {
    if (!barberClientPhoto) return;
    setIsLoading(true);
    setLoadingMessage("Consultando o Barbeiro Visagista...");
    try {
      const result = await generateBarberReport(
        barberClientPhoto,
        barberReferencePhoto,
        barberDescription
      );
      setBarberReport(result);
    } catch (e) {
      console.error(e);
      alert("Erro ao gerar relatório de barbeiro.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateTherapy = async () => {
    if (!therapyClientPhoto) return;
    setIsLoading(true);
    setLoadingMessage("Analisando saúde capilar e criando cronograma...");
    try {
      const result = await generateHairTherapyReport(
        therapyClientPhoto,
        therapyBrand,
        therapyDescription
      );
      setTherapyReport(result);
    } catch (e) {
      console.error(e);
      alert("Erro ao gerar análise terapêutica.");
    } finally {
      setIsLoading(false);
    }
  };

  // Se não autenticado, mostra tela de login/cadastro
  if (!isAuthenticated) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col">
      <Header
        onShowSavedPlans={() => setIsSavedPlansOpen(true)}
        onOpenPaymentModal={() => setIsPaymentModalOpen(true)}
        onStartTutorial={() => {
          if (activeTab === "hairstylist") setTutorialType("analyze");
          else if (activeTab === "colorist") setTutorialType("color-expert");
          else if (activeTab === "visagism360") setTutorialType("visagism-360");
          else if (activeTab === "barber") setTutorialType("barber");
          else if (activeTab === "therapy") setTutorialType("therapy");

          setTutorialStep(0);
          setIsTutorialOpen(true);
        }}
        onToggleFullscreen={() => {
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
          } else {
            if (document.exitFullscreen) {
              document.exitFullscreen();
              setIsFullscreen(false);
            }
          }
        }}
        isFullscreen={isFullscreen}
        onUndo={() => {}}
        onRedo={() => {}}
        canUndo={false}
        canRedo={false}
        onLogout={handleLogout}
        isAdmin={isAdmin}
      />

      <main className="flex-grow container mx-auto p-4 flex flex-col lg:flex-row gap-4">
        <div className="w-full lg:w-2/3 flex flex-col gap-4">
          <div className="flex space-x-2 bg-gray-800 p-2 rounded-xl shrink-0 overflow-x-auto">
            <button
              onClick={() => setActiveTab("hairstylist")}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === "hairstylist"
                  ? "bg-emerald-600 text-white"
                  : "text-gray-400 hover:bg-gray-700"
              }`}
            >
              Hairstylist Visagista
            </button>
            <button
              onClick={() => setActiveTab("visagism360")}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === "visagism360"
                  ? "bg-purple-600 text-white"
                  : "text-gray-400 hover:bg-gray-700"
              }`}
            >
              Visagismo 360°
            </button>
            <button
              onClick={() => setActiveTab("colorist")}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === "colorist"
                  ? "bg-emerald-600 text-white"
                  : "text-gray-400 hover:bg-gray-700"
              }`}
            >
              Colorista Expert
            </button>
            <button
              onClick={() => setActiveTab("barber")}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === "barber"
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:bg-gray-700"
              }`}
            >
              Barbeiro Visagista
            </button>
            <button
              onClick={() => setActiveTab("therapy")}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === "therapy"
                  ? "bg-cyan-600 text-white"
                  : "text-gray-400 hover:bg-gray-700"
              }`}
            >
              Terapeuta Capilar
            </button>
          </div>

          <div className="flex-grow bg-gray-800 rounded-2xl overflow-hidden relative min-h-[600px]">
            {activeTab === "hairstylist" &&
              (hairstylistReport ? (
                <HairstylistReportDisplay
                  reportData={hairstylistReport}
                  clientImage={
                    clientPhoto ? URL.createObjectURL(clientPhoto) : ""
                  }
                  referenceImage={
                    referencePhoto ? URL.createObjectURL(referencePhoto) : ""
                  }
                  onReset={() => {
                    setHairstylistReport(null);
                    setClientPhoto(null);
                    setReferencePhoto(null);
                    setHairstylistDescription("");
                  }}
                  setIsLoading={setIsLoading}
                  setLoadingMessage={setLoadingMessage}
                  setShareMessage={setShareMessage}
                />
              ) : (
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div
                      className="bg-gray-700/30 rounded-xl p-4 flex flex-col min-h-[450px]"
                      id="image-uploader-container"
                    >
                      <h3 className="text-lg font-semibold mb-4 text-emerald-300">
                        1. Foto da Cliente
                      </h3>
                      <div className="flex-grow">
                        <ImageInput onImageUpload={setClientPhoto} />
                      </div>
                    </div>
                    <div className="bg-gray-700/30 rounded-xl p-4 flex flex-col min-h-[450px]">
                      <h3 className="text-lg font-semibold mb-2 text-emerald-300">
                        2. Estilo Desejado
                      </h3>
                      <p className="text-xs text-gray-400 mb-2">
                        Envie uma foto de referência E/OU descreva o corte.
                      </p>
                      <div className="h-64 mb-4">
                        <ImageInput onImageUpload={setReferencePhoto} />
                      </div>
                      <textarea
                        placeholder="Descreva o estilo do corte (ex: Long Bob repicado com franja...)"
                        value={hairstylistDescription}
                        onChange={(e) =>
                          setHairstylistDescription(e.target.value)
                        }
                        className="w-full bg-gray-900 rounded-lg p-3 text-white border border-gray-600 focus:border-emerald-500 focus:outline-none resize-none flex-grow"
                      />
                    </div>
                  </div>
                  <div className="mt-6 flex flex-col items-center justify-center gap-4">
                    <select
                      value={homeCareBrand}
                      onChange={(e) => setHomeCareBrand(e.target.value)}
                      className="bg-gray-900 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-emerald-500"
                    >
                      <option>Wella Professionals</option>
                      <option>L'Oréal Professionnel</option>
                      <option>Schwarzkopf Professional</option>
                      <option>Truss</option>
                      <option>Braé</option>
                      <option>Keune</option>
                    </select>
                    <button
                      onClick={handleGenerateHairstylistReport}
                      disabled={
                        !clientPhoto ||
                        (!referencePhoto && !hairstylistDescription.trim())
                      }
                      className="px-8 py-3 bg-emerald-600 text-white rounded-lg font-bold text-lg hover:bg-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Gerar Análise Visagista
                    </button>
                  </div>
                </div>
              ))}

            {activeTab === "visagism360" &&
              (visagism360Report ? (
                <Visagism360Display
                  report={visagism360Report}
                  clientImage={
                    visagism360Image
                      ? URL.createObjectURL(visagism360Image)
                      : ""
                  }
                  onReset={() => {
                    setVisagism360Report(null);
                    setVisagism360Image(null);
                  }}
                  setIsLoading={setIsLoading}
                  setShareMessage={setShareMessage}
                />
              ) : (
                <div className="p-6 flex flex-col h-full">
                  <div className="flex-grow flex flex-col justify-center max-w-2xl mx-auto w-full">
                    <h2 className="text-2xl font-bold text-center mb-2 text-purple-300">
                      Visagismo 360°
                    </h2>
                    <p className="text-gray-400 text-center mb-8">
                      Análise facial completa, colorimetria pessoal e sugestões
                      de corte em um clique.
                    </p>

                    <div
                      id="visagism-upload-container"
                      className="bg-gray-700/30 rounded-xl p-4 flex flex-col h-[500px]"
                    >
                      <h3 className="text-lg font-semibold mb-4 text-purple-300">
                        Foto da Cliente (Rosto bem iluminado)
                      </h3>
                      <div className="flex-grow">
                        <ImageInput onImageUpload={setVisagism360Image} />
                      </div>
                    </div>

                    <div className="mt-8 flex justify-center">
                      <button
                        id="visagism-generate-btn"
                        onClick={handleGenerateVisagism360}
                        disabled={!visagism360Image}
                        className="px-8 py-3 bg-purple-600 text-white rounded-lg font-bold text-lg hover:bg-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-900/50"
                      >
                        Iniciar Consultoria 360°
                      </button>
                    </div>
                  </div>
                </div>
              ))}

            {activeTab === "colorist" &&
              (coloristReport ? (
                <ColoristReportDisplay
                  reportData={{
                    report: coloristReport.report,
                    tryOnImage: coloristReport.tryOnImage,
                  }}
                  clientImage={
                    clientImageForColor
                      ? URL.createObjectURL(clientImageForColor)
                      : ""
                  }
                  onReset={() => {
                    setColoristReport(null);
                    setColoristDescription("");
                    setColoristReferencePhoto(null);
                    setClientImageForColor(null);
                  }}
                  setIsLoading={setIsLoading}
                  setLoadingMessage={setLoadingMessage}
                  setShareMessage={setShareMessage}
                />
              ) : (
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div
                      className="bg-gray-700/30 rounded-xl p-4 flex flex-col min-h-[450px]"
                      id="colorist-client-photo-container"
                    >
                      <h3 className="text-lg font-semibold mb-4 text-emerald-300">
                        1. Foto da Cliente
                      </h3>
                      <div className="flex-grow">
                        <ImageInput onImageUpload={setClientImageForColor} />
                      </div>
                    </div>
                    <div
                      className="bg-gray-700/30 rounded-xl p-4 flex flex-col min-h-[450px]"
                      id="colorist-inspiration-container"
                    >
                      <h3 className="text-lg font-semibold mb-2 text-emerald-300">
                        2. Inspiração de Cor
                      </h3>
                      <p className="text-xs text-gray-400 mb-2">
                        Envie uma referência E/OU descreva a cor.
                      </p>
                      <div className="flex-grow flex flex-col gap-4">
                        <div className="h-64 mb-4">
                          <ImageInput
                            onImageUpload={setColoristReferencePhoto}
                          />
                        </div>
                        <textarea
                          placeholder="Descreva a cor e técnica desejada (ex: Morena iluminada em tons de mel...)"
                          value={coloristDescription}
                          className="w-full bg-gray-900 rounded-lg p-3 text-white border border-gray-600 focus:border-emerald-500 focus:outline-none resize-none flex-grow"
                          onChange={(e) =>
                            setColoristDescription(e.target.value)
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 flex flex-col items-center gap-4">
                    <select
                      id="brand-select"
                      value={cosmeticsBrand}
                      onChange={(e) => setCosmeticsBrand(e.target.value)}
                      className="bg-gray-900 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-emerald-500"
                    >
                      <option>Wella Professionals</option>
                      <option>L'Oréal Professionnel</option>
                      <option>Schwarzkopf Professional</option>
                      <option>Truss</option>
                      <option>Braé</option>
                      <option>Keune</option>
                    </select>
                    <button
                      id="colorist-generate-button"
                      onClick={async () => {
                        if (
                          !clientImageForColor ||
                          (!coloristReferencePhoto &&
                            !coloristDescription.trim())
                        )
                          return;

                        setIsLoading(true);
                        setLoadingMessage(
                          "Gerando relatório de colorimetria expert..."
                        );
                        try {
                          const result = await generateColoristReport(
                            clientImageForColor,
                            coloristReferencePhoto,
                            coloristDescription,
                            cosmeticsBrand
                          );
                          setColoristReport(result);
                        } catch (e) {
                          console.error(e);
                          alert("Erro ao gerar relatório.");
                        } finally {
                          setIsLoading(false);
                        }
                      }}
                      disabled={
                        !clientImageForColor ||
                        (!coloristReferencePhoto && !coloristDescription.trim())
                      }
                      className="px-8 py-3 bg-emerald-600 text-white rounded-lg font-bold text-lg hover:bg-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Gerar Análise Colorista
                    </button>
                  </div>
                </div>
              ))}

            {activeTab === "barber" &&
              (barberReport ? (
                <BarberReportDisplay
                  report={barberReport.report}
                  clientImage={
                    barberClientPhoto
                      ? URL.createObjectURL(barberClientPhoto)
                      : ""
                  }
                  referenceImage={
                    barberReferencePhoto
                      ? URL.createObjectURL(barberReferencePhoto)
                      : ""
                  }
                  simulatedImage={barberReport.simulatedImage}
                  onReset={() => {
                    setBarberReport(null);
                    setBarberClientPhoto(null);
                    setBarberReferencePhoto(null);
                    setBarberDescription("");
                  }}
                  setIsLoading={setIsLoading}
                  setLoadingMessage={setLoadingMessage}
                  setShareMessage={setShareMessage}
                />
              ) : (
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div
                      id="barber-upload-client"
                      className="bg-gray-700/30 rounded-xl p-4 flex flex-col min-h-[450px]"
                    >
                      <h3 className="text-lg font-semibold mb-4 text-blue-300">
                        1. Foto do Cliente
                      </h3>
                      <div className="flex-grow">
                        <ImageInput onImageUpload={setBarberClientPhoto} />
                      </div>
                    </div>
                    <div
                      id="barber-upload-ref"
                      className="bg-gray-700/30 rounded-xl p-4 flex flex-col min-h-[450px]"
                    >
                      <h3 className="text-lg font-semibold mb-2 text-blue-300">
                        2. Estilo Desejado (Opcional)
                      </h3>
                      <p className="text-xs text-gray-400 mb-2">
                        Envie referência ou descreva o corte/barba.
                      </p>
                      <div className="h-64 mb-4">
                        <ImageInput onImageUpload={setBarberReferencePhoto} />
                      </div>
                      <textarea
                        placeholder="Descreva o corte (ex: Low Fade com pompadour...)"
                        value={barberDescription}
                        onChange={(e) => setBarberDescription(e.target.value)}
                        className="w-full bg-gray-900 rounded-lg p-3 text-white border border-gray-600 focus:border-blue-500 focus:outline-none resize-none flex-grow"
                      />
                    </div>
                  </div>
                  <div className="mt-6 flex flex-col items-center justify-center gap-4">
                    <button
                      id="barber-generate-btn"
                      onClick={handleGenerateBarber}
                      disabled={!barberClientPhoto}
                      className="px-8 py-3 bg-blue-600 text-white rounded-lg font-bold text-lg hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-900/50"
                    >
                      Consultar Barbeiro Visagista
                    </button>
                  </div>
                </div>
              ))}

            {activeTab === "therapy" &&
              (therapyReport ? (
                <HairTherapyReportDisplay
                  report={therapyReport.report}
                  clientImage={
                    therapyClientPhoto
                      ? URL.createObjectURL(therapyClientPhoto)
                      : ""
                  }
                  simulatedImage={therapyReport.simulatedImage}
                  onReset={() => {
                    setTherapyReport(null);
                    setTherapyClientPhoto(null);
                    setTherapyDescription("");
                  }}
                  setIsLoading={setIsLoading}
                  setLoadingMessage={setLoadingMessage}
                  setShareMessage={setShareMessage}
                />
              ) : (
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div
                      id="therapy-upload-container"
                      className="bg-gray-700/30 rounded-xl p-4 flex flex-col min-h-[400px]"
                    >
                      <h3 className="text-lg font-semibold mb-4 text-cyan-300">
                        1. Foto do Cabelo (Foco nos fios)
                      </h3>
                      <div className="flex-grow">
                        <ImageInput onImageUpload={setTherapyClientPhoto} />
                      </div>
                    </div>
                    <div className="bg-gray-700/30 rounded-xl p-4 flex flex-col min-h-[400px]">
                      <h3 className="text-lg font-semibold mb-4 text-cyan-300">
                        2. Relato do Problema (Opcional)
                      </h3>
                      <p className="text-xs text-gray-400 mb-2">
                        Descreva o que incomoda (queda, ressecamento, quebra,
                        etc).
                      </p>
                      <textarea
                        placeholder="Ex: Meu cabelo está muito seco nas pontas e quebrando fácil..."
                        value={therapyDescription}
                        onChange={(e) => setTherapyDescription(e.target.value)}
                        className="w-full bg-gray-900 rounded-lg p-4 text-white border border-gray-600 focus:border-cyan-500 focus:outline-none resize-none flex-grow"
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col items-center gap-4">
                    <div className="w-full max-w-sm">
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Marca Preferida para Tratamento:
                      </label>
                      <select
                        value={therapyBrand}
                        onChange={(e) => setTherapyBrand(e.target.value)}
                        className="w-full bg-gray-900 text-white px-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:border-cyan-500"
                      >
                        <option>Kérastase</option>
                        <option>L'Oréal Professionnel</option>
                        <option>Redken</option>
                        <option>Davines</option>
                        <option>Wella Professionals</option>
                        <option>Truss</option>
                        <option>Joico</option>
                        <option>Braé</option>
                        <option>Keune</option>
                      </select>
                    </div>

                    <button
                      id="therapy-generate-btn"
                      onClick={handleGenerateTherapy}
                      disabled={!therapyClientPhoto}
                      className="px-8 py-3 bg-cyan-600 text-white rounded-lg font-bold text-lg hover:bg-cyan-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-900/50"
                    >
                      Gerar Diagnóstico e Receita
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div
          className="w-full lg:w-1/3 flex flex-col gap-4 lg:h-[calc(100vh-112px)] lg:sticky lg:top-[96px]"
          id="chat-panel-container"
        >
          <div className="flex-grow bg-gray-800 rounded-2xl overflow-hidden shadow-lg border border-gray-700">
            <ChatPanel />
          </div>
        </div>
      </main>

      {isLoading && <LoadingOverlay message={loadingMessage} />}
      {shareMessage && (
        <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-6 py-3 rounded-lg shadow-xl border border-gray-700 z-50 animate-fade-in-up">
          {shareMessage}
        </div>
      )}

      {isTutorialOpen && (
        <TutorialOverlay
          step={tutorialStep}
          onNext={() => setTutorialStep((p) => p + 1)}
          onSkip={() => setIsTutorialOpen(false)}
          tutorialType={tutorialType}
        />
      )}

      <SavedPlansModal
        isOpen={isSavedPlansOpen}
        onClose={() => setIsSavedPlansOpen(false)}
        plans={savedPlans}
        onLoadPlan={(id) => {
          const plan = savedPlans.find((p) => p.id === id);
          if (plan) {
            alert(
              "Carregar planos antigos ainda não é totalmente suportado na nova interface."
            );
            setIsSavedPlansOpen(false);
          }
        }}
        onDeletePlan={(id) => {
          const updated = savedPlans.filter((p) => p.id !== id);
          setSavedPlans(updated);
          localStorage.setItem("savedPlans", JSON.stringify(updated));
        }}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        user={currentUser}
        onSubscriptionUpdated={handleSubscriptionUpdated}
      />
      <CatalogModal
        isOpen={isCatalogOpen}
        onClose={() => setIsCatalogOpen(false)}
        onImageSelect={async (url, name) => {
          setIsCatalogOpen(false);
          alert("Seleção do catálogo a ser adaptada para o novo fluxo.");
        }}
      />
    </div>
  );
}
