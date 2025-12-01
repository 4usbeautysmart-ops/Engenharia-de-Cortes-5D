import React from 'react';
import type { SavedPlan } from '../types';
import { Icon } from './Icon';

interface SavedPlansModalProps {
  isOpen: boolean;
  onClose: () => void;
  plans: SavedPlan[];
  onLoadPlan: (id: number) => void;
  onDeletePlan: (id: number) => void;
}

export const SavedPlansModal: React.FC<SavedPlansModalProps> = ({ isOpen, onClose, plans, onLoadPlan, onDeletePlan }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-4xl max-h-[80vh] flex flex-col shadow-2xl shadow-emerald-500/10" onClick={(e) => e.stopPropagation()}>
        <div className="flex-shrink-0 flex justify-between items-center pb-4 mb-4 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-green-400">
            Planos de Corte Salvos
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-700">
            <Icon name="close" className="w-6 h-6 text-gray-400" />
          </button>
        </div>
        
        <div className="flex-grow overflow-y-auto pr-2">
            {plans.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <Icon name="save" className="w-16 h-16 mb-4"/>
                    <p>Nenhum plano salvo ainda.</p>
                    <p className="text-sm">Use o botão "Salvar Plano" para guardar seus trabalhos.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {plans.map((savedPlan) => (
                        <div key={savedPlan.id} className="bg-gray-700/50 rounded-lg p-4 flex flex-col justify-between">
                            <div>
                                <img src={`data:image/png;base64,${savedPlan.referenceImage}`} alt={savedPlan.plan.styleName} className="w-full h-40 object-cover rounded-md mb-3" />
                                <h3 className="font-semibold text-gray-200 truncate">{savedPlan.plan.styleName}</h3>
                                <p className="text-xs text-gray-400">Salvo em: {new Date(savedPlan.id).toLocaleDateString()}</p>
                            </div>
                            <div className="flex gap-2 mt-4">
                                <button onClick={() => onLoadPlan(savedPlan.id)} className="flex-1 px-3 py-2 bg-emerald-600 text-white rounded-md text-sm font-medium hover:bg-emerald-500 transition-colors">
                                    Carregar
                                </button>
                                <button onClick={() => onDeletePlan(savedPlan.id)} className="px-3 py-2 bg-red-600/80 text-white rounded-md text-sm font-medium hover:bg-red-500 transition-colors">
                                    Excluir
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};