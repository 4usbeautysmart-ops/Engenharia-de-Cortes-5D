
import React from 'react';
import { Icon } from './Icon';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const premiumFeatures = [
    "Análises de corte e cor ilimitadas",
    "Salvar até 100 planos de corte",
    "Visualização 3D interativa avançada",
    "Exportação de PDF em alta resolução",
    "Acesso a novos modelos de IA antecipadamente",
    "Suporte prioritário por e-mail"
  ];

  return (
    <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-gray-800 rounded-2xl p-8 w-full max-w-md flex flex-col shadow-2xl shadow-emerald-500/10" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start pb-4 mb-4 border-b border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-400">
              Engenharia de Cortes 5D Premium
            </h2>
            <p className="text-gray-400 mt-1">Desbloqueie todo o potencial da IA.</p>
            
            <div className="mt-3">
                <p className="text-3xl font-bold text-white">R$ 249,00 <span className="text-sm font-normal text-gray-400">/mês</span></p>
                <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 rounded-full">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <p className="text-xs font-bold text-emerald-300 uppercase tracking-wide">2 Dias de Teste Grátis</p>
                </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-700">
            <Icon name="close" className="w-6 h-6 text-gray-400" />
          </button>
        </div>
        
        <div className="flex-grow space-y-4 mb-8">
            <ul className="space-y-3">
                {premiumFeatures.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                        <div className="bg-emerald-600/20 p-1 rounded-full">
                            <Icon name="check" className="w-4 h-4 text-emerald-300" />
                        </div>
                        <span className="text-gray-200">{feature}</span>
                    </li>
                ))}
            </ul>
        </div>
        
        <a 
            href="https://www.mercadopago.com.br/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg font-bold text-lg text-center py-3 hover:from-blue-500 hover:to-blue-400 transition-all shadow-lg hover:shadow-blue-500/30 flex items-center justify-center gap-3 group"
        >
             <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="group-hover:scale-110 transition-transform">
                <path d="M19.316 4.00031H4.68305C4.2982 4.00031 3.9873 4.31121 3.9873 4.69606V19.3036C3.9873 19.6884 4.2982 19.9993 4.68305 19.9993H19.316C19.7008 19.9993 20.0117 19.6884 20.0117 19.3036V4.69606C20.0117 4.31121 19.7008 4.00031 19.316 4.00031ZM16.3243 16.5168H13.1118C12.8028 16.5168 12.5513 16.2652 12.5513 15.9563V8.04431C12.5513 7.73536 12.8028 7.48381 13.1118 7.48381H14.1611C15.9389 7.48381 17.3736 8.87781 17.3736 10.6387C17.3736 11.9542 16.6971 13.0642 15.6577 13.5645L16.5938 15.9563C16.6669 16.1557 16.5938 16.381 16.425 16.471C16.3884 16.497 16.3519 16.5055 16.3153 16.5168H16.3243ZM11.1613 16.5168H7.9488C7.63985 16.5168 7.3883 16.2652 7.3883 15.9563V8.04431C7.3883 7.73536 7.63985 7.48381 7.9488 7.48381H8.99805C10.7759 7.48381 12.2106 8.87781 12.2106 10.6387C12.2106 11.9542 11.5341 13.0642 10.4947 13.5645L11.4308 15.9563C11.5039 16.1557 11.4308 16.381 11.262 16.471C11.2255 16.497 11.1889 16.5055 11.1524 16.5168H11.1613Z" />
                <path d="M14.1611 8.65331H13.6718V12.7213H14.1611C15.2834 12.7213 16.1743 11.8304 16.1743 10.6867C16.1743 9.54306 15.2834 8.65331 14.1611 8.65331Z" />
                <path d="M8.99805 8.65331H8.5088V12.7213H8.99805C10.1204 12.7213 11.0113 11.8304 11.0113 10.6867C11.0113 9.54306 10.1204 8.65331 8.99805 8.65331Z" />
            </svg>
            Iniciar Teste Grátis
        </a>
        <p className="text-xs text-center text-gray-500 mt-3">* Você não será cobrado se cancelar dentro de 2 dias.</p>

      </div>
    </div>
  );
};
