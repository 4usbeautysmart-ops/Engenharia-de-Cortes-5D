import React from 'react';
import { Icon } from './Icon';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  isForced?: boolean;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, isForced = false }) => {
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
    <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50" onClick={isForced ? undefined : onClose}>
      <div className="bg-gray-800 rounded-2xl p-8 w-full max-w-md flex flex-col shadow-2xl shadow-emerald-500/10" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start pb-4 mb-4 border-b border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-400">
              Engenharia de Cortes 5D Premium
            </h2>
            <p className="text-gray-400 mt-1">Desbloqueie todo o potencial da IA.</p>
          </div>
          {!isForced && (
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-700">
              <Icon name="close" className="w-6 h-6 text-gray-400" />
            </button>
          )}
        </div>
        
        <div className="bg-emerald-900/50 border border-emerald-500/30 text-center p-3 rounded-lg mb-6">
            <p className="font-semibold text-emerald-300">Uso gratuito por 48 horas para experimentar!</p>
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
        
        <div className="text-center mb-6">
            <p className="text-4xl font-bold text-white">R$ 249<span className="text-lg text-gray-400 font-normal"> / mês</span></p>
        </div>
        
        <a 
            href="https://www.mercadopago.com.br/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full bg-blue-500 text-white rounded-lg font-bold text-lg text-center py-3 hover:bg-blue-400 transition-colors flex items-center justify-center gap-3"
        >
             <Icon name="credit-card" className="w-6 h-6" />
             Assinar Agora
        </a>
        <p className="text-xs text-center text-gray-500 mt-3">* Você será redirecionado para um ambiente de pagamento seguro. Esta é uma demonstração.</p>

      </div>
    </div>
  );
};