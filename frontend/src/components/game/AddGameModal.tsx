import React from 'react';
import { X } from 'lucide-react';
import { Game } from '../../types/game';
import GameSearchBar from '../ui/GameSearchBar';
import AddGameManualForm from './AddGameManualForm';
import GamePreviewCard from './GamePreviewCard';
import { useAddGameForm } from '../../hooks/useAddGameForm';

export { type GameFormData } from '../../hooks/useAddGameForm';

interface AddGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefillGame?: Partial<Game> | null;
  onSuccess?: () => void;
}

export default function AddGameModal({ 
  isOpen, 
  onClose,
  prefillGame,
  onSuccess
}: AddGameModalProps) {
  const {
    activeTab,
    setActiveTab,
    gameData,
    formError,
    isAutoFilled,
    originalMetacritic,
    isSubmitting,
    handleGameSelect,
    handleGameDataChange,
    handleGenreToggle,
    handleImageUpload,
    removeImage,
    handleSave
  } = useAddGameForm(isOpen, onClose, prefillGame, onSuccess);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>

      {/* Modal */}
      <div className="relative bg-primary-bg border border-border-color rounded-xl w-full max-w-[800px] max-h-[80vh] overflow-auto">
        {/* Header */}
        <div className="p-8 border-b border-border-color">
          <div className="flex justify-between items-center">
            <h2 className="font-montserrat font-bold text-[28px] text-text-primary">
              Aggiungi nuovo gioco
            </h2>
            <button
              onClick={onClose}
              className="text-text-secondary hover:text-accent-primary transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-border-color mb-6">
          <div className="flex">
            <button
              className={`px-6 py-3 font-roboto font-medium text-base transition-colors ${
                activeTab === "search"
                  ? "text-text-primary border-b-[3px] border-accent-primary"
                  : "text-text-secondary hover:text-accent-primary"
              }`}
              onClick={() => setActiveTab("search")}
            >
              Ricerca automatica
            </button>
            <button
              className={`px-6 py-3 font-roboto font-medium text-base transition-colors ${
                activeTab === "manual"
                  ? "text-text-primary border-b-[3px] border-accent-primary"
                  : "text-text-secondary hover:text-accent-primary"
              }`}
              onClick={() => setActiveTab("manual")}
            >
              Inserimento manuale
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-8">
          {/* Tab content */}
          {activeTab === "search" ? (
            <div className="mb-8">
              <GameSearchBar
                placeholder="Cerca titolo del gioco..."
                onGameSelect={handleGameSelect}
                buttonText="Seleziona"
                buttonVariant="primary"
                maxResults={8}
                showTooltip={true}
                className="mb-6"
              />
            </div>
          ) : (
            <div id="add-game-manual-tab" className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              <AddGameManualForm 
                gameData={gameData} 
                handleGameDataChange={handleGameDataChange} 
                handleGenreToggle={handleGenreToggle}
                handleImageUpload={handleImageUpload}
                removeImage={removeImage}
                formError={formError}
                isAutoFilled={isAutoFilled}
                originalMetacritic={originalMetacritic}
              />

              {/* Anteprima */}
              <div className="lg:col-span-1">
                <GamePreviewCard gameData={gameData} />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-border-color flex flex-wrap justify-between gap-4">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-primary-bg border border-border-color text-text-primary font-roboto font-medium text-base rounded-lg hover:bg-secondary-bg transition-colors"
          >
            Annulla
          </button>
          {activeTab === "manual" && (
            <button
              onClick={() => handleSave()}
              disabled={isSubmitting}
              className={`px-6 py-3 text-white font-roboto font-medium text-base rounded-lg transition-colors flex items-center justify-center min-w-[120px] ${
                isSubmitting ? "bg-accent-primary/70 cursor-not-allowed" : "bg-accent-primary hover:opacity-90"
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  Salvataggio...
                </>
              ) : (
                "Salva"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}