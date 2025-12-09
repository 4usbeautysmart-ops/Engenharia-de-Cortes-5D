
import React from 'react';
import { Icon } from './Icon';
import { Logo } from './Logo';

interface HeaderProps {
    onShowSavedPlans: () => void;
    onOpenPaymentModal: () => void;
    onStartTutorial: () => void;
    onToggleFullscreen: () => void;
    isFullscreen: boolean;
    onUndo: () => void;
    onRedo: () => void;
    canUndo: boolean;
    canRedo: boolean;
    onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
    onShowSavedPlans, 
    onOpenPaymentModal,
    onStartTutorial, 
    onToggleFullscreen, 
    isFullscreen,
    onUndo,
    onRedo,
    canUndo,
    canRedo,
    onLogout
}) => {
  return (
    <header className="p-4 bg-gray-900/80 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-10">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Logo className="w-12 h-12" />
          <h1 className="text-2xl font-light tracking-wider">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-500">Engenharia de Cortes 5D</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
                <button
                onClick={onUndo}
                disabled={!canUndo}
                className="p-2 bg-gray-700/80 rounded-lg text-gray-200 hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-700/80"
                title="Desfazer (Ctrl+Z)"
                >
                <Icon name="undo" className="w-5 h-5" />
                </button>
                <button
                onClick={onRedo}
                disabled={!canRedo}
                className="p-2 bg-gray-700/80 rounded-lg text-gray-200 hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-700/80"
                title="Refazer (Ctrl+Y)"
                >
                <Icon name="redo" className="w-5 h-5" />
                </button>
            </div>
            <div className="w-px h-8 bg-gray-700"></div>
            <button 
              onClick={onToggleFullscreen}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700/80 rounded-lg text-sm font-medium text-gray-200 hover:bg-emerald-600 transition-colors"
              title={isFullscreen ? 'Sair da Tela Cheia' : 'Expandir Tela'}
            >
              <Icon name={isFullscreen ? 'compress' : 'expand'} className="w-5 h-5" />
              {isFullscreen ? 'Restaurar' : 'Expandir'}
            </button>
            <button 
              id="header-help-button"
              onClick={onStartTutorial}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700/80 rounded-lg text-sm font-medium text-gray-200 hover:bg-emerald-600 transition-colors"
            >
              <Icon name="help" className="w-5 h-5" />
              Ajuda
            </button>
            <button 
              id="header-saved-plans-button"
              onClick={onShowSavedPlans}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700/80 rounded-lg text-sm font-medium text-gray-200 hover:bg-emerald-600 transition-colors"
            >
              <Icon name="save" className="w-5 h-5" />
              Planos Salvos
            </button>
            <button 
              onClick={onOpenPaymentModal}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500/80 rounded-lg text-sm font-bold text-white hover:bg-amber-500 transition-colors shadow-md shadow-amber-500/20"
            >
              <Icon name="credit-card" className="w-5 h-5" />
              Seja Premium
            </button>
            <button 
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700/80 rounded-lg text-sm font-medium text-gray-200 hover:bg-red-600 transition-colors"
              title="Sair do Aplicativo"
            >
              <Icon name="logout" className="w-5 h-5" />
              Sair
            </button>
        </div>
      </div>
    </header>
  );
};
