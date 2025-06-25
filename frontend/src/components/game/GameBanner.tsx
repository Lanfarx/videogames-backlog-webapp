import { useState } from 'react';
import { ChevronDown, Pencil, Trash2, Award, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { Game } from '../../types/game';
import { getStatusColor, getStatusLabel } from '../../constants/gameConstants';
import GameCover from './GameCover';
import GenreTagList from '../ui/GenreTagList';
import StatusChangePopover from '../ui/StatusChangePopover';
import ConfirmationModal from '../ui/ConfirmationModal';
import EditGameDetailsModal from './EditGameDetailsModal';
import { useGameActions } from '../../store/hooks/gamesHooks';
import { formatMetacriticScore } from '../../utils/gameDisplayUtils';

interface GameBannerProps {
  game: Game;
  onChangeStatus?: (newStatus: Game['Status']) => void;
  onEdit?: (updatedGame: Partial<Game>) => void;
  onDelete?: () => void;
  onBack?: () => void;
  showBackButton?: boolean;
  // Nuove props per la navigazione
  canGoToPrevious?: boolean;
  canGoToNext?: boolean;
  onGoToPrevious?: () => void;
  onGoToNext?: () => void;
  currentIndex?: number;
  totalGames?: number;
}

const GameBanner = ({ 
  game, 
  onChangeStatus, 
  onEdit, 
  onDelete, 
  onBack, 
  showBackButton = false,
  canGoToPrevious = false,
  canGoToNext = false,
  onGoToPrevious,
  onGoToNext,
  currentIndex,
  totalGames
}: GameBannerProps) => {
  const { remove } = useGameActions();
  
  // Ottieni l'etichetta in italiano per lo stato attuale
  const currentStatusLabel = getStatusLabel(game.Status);
  const [showStatusPopover, setShowStatusPopover] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  const handleStatusChange = (newStatus: Game['Status']) => {
    if (onChangeStatus) {
      onChangeStatus(newStatus);
      setShowStatusPopover(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirmation(true);
  };

  const handleConfirmDelete = () => {
    // Usa la logica centralizzata per eliminare il gioco
    remove(game.id);
    // Chiama anche il callback opzionale per compatibilità
    if (onDelete) {
      onDelete();
    }
    setShowDeleteConfirmation(false);
  };
  
  const handleEditClick = () => {
    setShowEditModal(true);
  };
  
  const handleSaveEdit = (updatedGame: Partial<Game>) => {
    if (onEdit) {
      onEdit(updatedGame);
    }
  };
  return (
    <section className="container mx-auto py-8 max-w-5xl">
      <div className="flex">
        {/* Pulsante Indietro - posizionato in alto a sinistra */}
        {showBackButton && onBack && (
          <div className="mr-4 flex items-start">
            <button 
              onClick={onBack}
              className="flex items-center gap-2 text-text-secondary hover:text-accent-primary transition-colors group"
            >
              <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Indietro</span>
            </button>
          </div>
        )}
        
        {/* Copertina */}
        <div className="mr-20">
          <GameCover 
            CoverImage={game.CoverImage} 
            title={game.Title} 
            Status={game.Status}
            size="xl"
          />
        </div>        {/* Info gioco */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            {/* Header con titolo e frecce di navigazione */}
            <div className="flex items-center justify-between mb-2">
              <h1 className="font-primary font-bold text-3xl text-text-primary">{game.Title}</h1>
              
              {/* Frecce di navigazione */}
              {(canGoToPrevious || canGoToNext) && (
                <div className="flex items-center gap-2">
                  {/* Indicatore posizione */}
                  {currentIndex !== undefined && totalGames !== undefined && (
                    <span className="text-text-secondary font-secondary text-sm px-3">
                      {currentIndex + 1} di {totalGames}
                    </span>
                  )}
                  
                  {/* Freccia precedente */}
                  <button
                    onClick={onGoToPrevious}
                    disabled={!canGoToPrevious}
                    className={`p-2 rounded-lg border transition-colors ${
                      canGoToPrevious
                        ? 'bg-primary-bg border-border-color text-text-primary hover:bg-secondary-bg hover:text-accent-primary'
                        : 'bg-primary-bg border-border-color text-text-disabled cursor-not-allowed'
                    }`}
                    title="Gioco precedente"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  
                  {/* Freccia successiva */}
                  <button
                    onClick={onGoToNext}
                    disabled={!canGoToNext}
                    className={`p-2 rounded-lg border transition-colors ${
                      canGoToNext
                        ? 'bg-primary-bg border-border-color text-text-primary hover:bg-secondary-bg hover:text-accent-primary'
                        : 'bg-primary-bg border-border-color text-text-disabled cursor-not-allowed'
                    }`}
                    title="Gioco successivo"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>            <div className="flex items-center mb-2">
              <p className="font-secondary text-base text-text-secondary">
                {game.Developer} / {game.Publisher}
              </p>              <div className="ml-4 flex items-center bg-yellow-500/10 px-2 py-1 rounded-md">
                <Award className="w-4 h-4 text-yellow-500 mr-1" />
                <span className="font-secondary text-base font-semibold text-text-secondary">{formatMetacriticScore(game.Metacritic)}</span>
              </div>
            </div>
            <p className="font-secondary text-sm text-text-secondary mb-4">
              {game.ReleaseYear}
            </p>
            
            {/* Generi - posizionati come nell'immagine */}
            <div className="mb-6">
              <GenreTagList Genres={game.Genres} maxDisplay={5} small={false} />
            </div>
          <div className="flex space-x-4 mt-5">
            <div className="relative">
              <button 
                className="flex items-center px-4 py-2 bg-accent-primary text-white rounded-lg font-secondary font-medium text-sm hover:bg-accent-primary/90 transition-colors"
                onClick={() => setShowStatusPopover(!showStatusPopover)}
              >
                Modifica stato: {currentStatusLabel}
                <ChevronDown className="ml-2 w-4 h-4" />
              </button>
              
              {showStatusPopover && (
                <StatusChangePopover 
                    currentStatus={game.Status}
                    onStatusChange={handleStatusChange}
                    onCancel={() => setShowStatusPopover(false)}
                    HoursPlayed={game.HoursPlayed} // Passiamo le ore di gioco
                    GameId={game.id}                />
              )}
            </div>
            <button 
              className="flex items-center px-4 py-2 bg-accent-success text-white rounded-lg font-secondary font-medium text-sm hover:bg-accent-success/90 transition-colors"
              onClick={handleEditClick}
            >
              <Pencil className="mr-2 w-4 h-4" />
              Modifica dettagli
            </button>
            <button 
              className="p-2 bg-primary-bg border border-border-color rounded-lg font-secondary text-sm hover:bg-secondary-bg transition-colors"
              onClick={handleDeleteClick}
            >
              <Trash2 className="w-5 h-5 text-accent-danger" />
            </button>
          </div>
          </div>
        </div>
      </div>

      {/* Modale di conferma per l'eliminazione */}
      <ConfirmationModal
        isOpen={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        onConfirm={handleConfirmDelete}
        title="Elimina gioco"
        message={`Sei sicuro di voler eliminare "${game.Title}" dalla tua collezione? Questa azione non può essere annullata.`}
        confirmButtontext="Elimina gioco"
        type="danger"
      />
      
      {/* Modale per la modifica dei dettagli */}
      <EditGameDetailsModal 
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleSaveEdit}
        game={game}
      />
    </section>
  );
};

export default GameBanner;
