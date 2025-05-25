import { useState, useEffect } from 'react';
import { Clock, Pencil } from 'lucide-react';
import { Game } from '../../types/game';
import RatingStars from '../ui/atoms/RatingStars';
import StatusBadge from '../ui/atoms/StatusBadge';
import PlaytimePopover from '../ui/PlaytimePopover';
import EditGameInfoModal from './EditGameInfoModal';
import { useGameById } from '../../store/hooks/gamesHooks';
import { getGameRating } from '../../utils/gamesUtils';

interface GameInfoCardProps {
  game: Game;
  onEditInfo?: (updatedGame: Partial<Game>) => void;
  onUpdatePlaytime?: (newHours: number) => void;
}

const GameInfoCard = ({ game, onEditInfo, onUpdatePlaytime }: GameInfoCardProps) => {
  const [isEditingHours, setIsEditingHours] = useState(false);
  const [showEditInfoModal, setShowEditInfoModal] = useState(false);
  
  // Ottieni il gioco aggiornato dallo stato globale Redux
  const currentGame = useGameById(game.id) || game;

  // Calcola il rating direttamente dalla review aggiornata
  const calculatedRating = currentGame.rating ?? getGameRating(currentGame);

  // Usa sempre le ore aggiornate dallo stato globale
  const displayedHours = currentGame.hoursPlayed;

  useEffect(() => {
    // Aggiorna dinamicamente il rating del gioco
    if (onEditInfo) {
      onEditInfo({ rating: calculatedRating });
    }
  }, [currentGame.review]);
  
  const handleSavePlaytime = (hoursToAdd: number) => {
    if (onUpdatePlaytime) {
      const newTotalHours = displayedHours + hoursToAdd;
      
      // Aggiorna l'UI immediatamente
      // Invia l'aggiornamento attraverso la callback
      onUpdatePlaytime(newTotalHours);
      
      // Chiudi il popover
      setIsEditingHours(false);
    }
  };
  
  const handleCancelPlaytime = () => {
    setIsEditingHours(false);
  };

  const handleEditInfoClick = () => {
    setShowEditInfoModal(true);
  };

  const handleSaveInfo = (updatedInfo: Partial<Game>) => {
    if (onEditInfo) {
      onEditInfo(updatedInfo);
    }
  };

  // Verifica se il gioco è stato completato o platinato
  const isCompleted = currentGame.status === "completed";
  const isPlatinum = currentGame.status === "platinum";
  const hasBeenCompleted = isCompleted || isPlatinum; // Sia i completati che i platinati sono stati completati

  return (
    <div className="bg-primary-bg border border-border-color rounded-xl p-6 mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-primary font-semibold text-xl text-text-primary">
          Informazioni
        </h2>
        {onEditInfo && (
          <Pencil 
            className="w-5 h-5 text-text-secondary hover:text-accent-primary cursor-pointer" 
            onClick={handleEditInfoClick}
          />
        )}
      </div>

      {/* Stato */}
      <div className="flex justify-between items-center py-3 border-b border-border-color">
        <span className="font-secondary font-medium text-sm text-text-secondary">
          Stato
        </span>
        <StatusBadge status={currentGame.status} />
      </div>

      {/* Piattaforma */}
      <div className="flex justify-between items-center py-3 border-b border-border-color">
        <span className="font-secondary font-medium text-sm text-text-secondary">
          Piattaforma
        </span>
        <span className="font-secondary text-base text-text-primary">
          {currentGame.platform || 'Non specificata'}
        </span>
      </div>

      {/* Tempo di gioco */}
      <div className="flex justify-between items-center py-3 border-b border-border-color">
        <span className="font-secondary font-medium text-sm text-text-secondary">
          Tempo di gioco
        </span>
        <div className="flex items-center relative">
          <span className="font-secondary font-semibold text-lg text-text-primary">
            {displayedHours} ore
          </span>
          
          {onUpdatePlaytime && (
            <>
              <Clock 
                className="w-4 h-4 text-accent-primary cursor-pointer ml-2"
                onClick={() => setIsEditingHours(!isEditingHours)}
              />
              
              {isEditingHours && (
                <PlaytimePopover 
                  gameId={currentGame.id}
                  currentHours={displayedHours}
                  onSave={handleSavePlaytime}
                  onCancel={handleCancelPlaytime}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* Prezzo - Spostato qui, subito dopo il tempo di gioco */}
      <div className="flex justify-between items-center py-3 border-b border-border-color">
        <span className="font-secondary font-medium text-sm text-text-secondary">
          Prezzo
        </span>
        <span className="font-secondary text-base text-text-primary">
          {currentGame.price ? `${currentGame.price.toFixed(2)} €` : 'Non specificato'}
        </span>
      </div>

      {/* Data di acquisto */}
      <div className="flex justify-between items-center py-3 border-b border-border-color">
        <span className="font-secondary font-medium text-sm text-text-secondary">
          Data di acquisto
        </span>
        <span className="font-secondary text-base text-text-primary">
          {currentGame.purchaseDate ? new Date(currentGame.purchaseDate).toLocaleDateString('it-IT') : 'Non specificata'}
        </span>
      </div>

      {/* Data di completamento - Mostrata per giochi completati E platinati */}
      {hasBeenCompleted && currentGame.completionDate && (
        <div className="flex justify-between items-center py-3 border-b border-border-color">
          <span className="font-secondary font-medium text-sm text-text-secondary">
            Data di completamento
          </span>
          <span className="font-secondary text-base text-text-primary">
            {new Date(currentGame.completionDate).toLocaleDateString('it-IT')}
          </span>
        </div>
      )}

      {/* Data di platino - Mostrata solo per giochi platinati */}
      {isPlatinum && currentGame.platinumDate && (
        <div className="flex justify-between items-center py-3 border-b border-border-color">
          <span className="font-secondary font-medium text-sm text-text-secondary">
            Data di platino
          </span>
          <span className="font-secondary text-base text-text-primary">
            {new Date(currentGame.platinumDate).toLocaleDateString('it-IT')}
          </span>
        </div>      )}
      
      {/* Valutazione */}
      <div className="py-3">
        <div className="flex justify-between items-center">
          <span className="font-secondary font-medium text-sm text-text-secondary">
            La tua valutazione
          </span>
          {calculatedRating === 0 ? (
            <span className="font-secondary text-base text-text-secondary italic">
              Non valutato
            </span>
          ) : (
            <RatingStars rating={calculatedRating} showValue={false} size="md" />
          )}
        </div>
      </div>
      
      {/* Modale di modifica delle informazioni */}
      <EditGameInfoModal
        isOpen={showEditInfoModal}
        onClose={() => setShowEditInfoModal(false)}
        onSave={handleSaveInfo}
        game={currentGame}
      />
    </div>
  );
};

export default GameInfoCard;
