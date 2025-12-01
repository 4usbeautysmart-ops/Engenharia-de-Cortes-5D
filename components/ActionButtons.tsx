

import React, { useState } from 'react';
import { Icon } from './Icon';
import { FilterButtons } from './FilterButtons';

interface ActionButtonsProps {
  onAnimate: () => void;
  onEdit: (prompt: string) => void;
  onApplyFilter: (filter: 'original' | 'sepia' | 'bw' | 'vibrant') => void;
  onTextToSpeech: () => void;
  onFindSupplies: () => void;
  onSave: () => void;
  onDownloadPdf: () => void;
  onShare: () => void;
  isReady: boolean;
  canAnimate: boolean;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({ 
    onAnimate, 
    onEdit, 
    onApplyFilter, 
    onTextToSpeech, 
    onFindSupplies, 
    onSave,
    onDownloadPdf,
    onShare,
    isReady,
    canAnimate,
}) => {
  const [editPrompt, setEditPrompt] = useState('');
  const [showEditInput, setShowEditInput] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editPrompt.trim()) {
      onEdit(editPrompt);
      setShowEditInput(false);
      setShowFilters(false);
      setEditPrompt('');
    }
  };

  const toggleEdit = () => {
    setShowEditInput(!showEditInput);
    if (!showEditInput) setShowFilters(false);
  }

  const toggleFilters = () => {
    setShowFilters(!showFilters);
    if (!showFilters) setShowEditInput(false);
  }


  const ActionButton = ({ id, icon, text, onClick, disabled = false }: { id?: string, icon: string, text: string, onClick: () => void, disabled?: boolean }) => (
    <button
      id={id}
      onClick={onClick}
      disabled={!isReady || disabled}
      className="flex flex-col items-center justify-center gap-2 p-4 bg-gray-700/80 rounded-lg text-center transition-all duration-200 hover:bg-emerald-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-700/80 disabled:hover:text-gray-300"
    >
      <Icon name={icon} className="w-8 h-8" />
      <span className="text-xs font-medium">{text}</span>
    </button>
  );

  return (
    <div id="action-buttons" className="bg-gray-800 rounded-2xl p-4">
      <div className="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-8 gap-4 text-gray-300">
        <ActionButton icon="video" text="Animar com Veo" onClick={onAnimate} disabled={!canAnimate} />
        <ActionButton id="action-button-edit" icon="edit" text="Editar Imagem" onClick={toggleEdit} />
        <ActionButton icon="filter" text="Filtros de Cor" onClick={toggleFilters} />
        <ActionButton icon="speak" text="Ler Plano" onClick={onTextToSpeech} />
        <ActionButton icon="store" text="Achar Fornecedores" onClick={onFindSupplies} />
        <ActionButton id="action-button-save" icon="save" text="Salvar Plano" onClick={onSave} />
        <ActionButton id="action-button-download" icon="download" text="Download PDF" onClick={onDownloadPdf} />
        <ActionButton id="action-button-share" icon="share" text="Compartilhar" onClick={onShare} />
      </div>
      {showEditInput && isReady && (
        <form onSubmit={handleEditSubmit} className="mt-4 flex gap-2">
          <input
            type="text"
            value={editPrompt}
            onChange={(e) => setEditPrompt(e.target.value)}
            placeholder="Ex: Mude a cor para ruivo"
            className="flex-grow bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-md font-medium hover:bg-emerald-500 transition-colors">
            Aplicar
          </button>
        </form>
      )}
       {showFilters && isReady && (
        <div className="mt-4">
          <FilterButtons onApplyFilter={onApplyFilter} />
        </div>
      )}
    </div>
  );
};