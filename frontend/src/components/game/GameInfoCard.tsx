import { useState, useEffect } from 'react';
import { Clock, Pencil } from 'lucide-react';
import { Game } from '../../types/game';
import RatingStars from '../ui/atoms/RatingStars';
import StatusBadge from '../ui/atoms/StatusBadge';
import PlaytimePopover from './ui/PlaytimePopover';

interface GameInfoCardProps {
  game: Game;
  onEdit?: () => void;
  onUpdatePlaytime?: (newHours: number) => void;
}

const GameInfoCard = ({ game, onEdit, onUpdatePlaytime }: GameInfoCardProps) => {
  const [isEditingHours, setIsEditingHours] = useState(false);
  const [displayedHours, setDisplayedHours] = useState(game.hoursPlayed);
  
  // Aggiorna le ore visualizzate quando cambia l'oggetto game
  useEffect(() => {
    setDisplayedHours(game.hoursPlayed);
  }, [game.hoursPlayed]);
  
  const handleSavePlaytime = (hoursToAdd: number) => {
    if (onUpdatePlaytime) {
      const newTotalHours = displayedHours + hoursToAdd;
      
      // Aggiorna l'UI immediatamente
      setDisplayedHours(newTotalHours);
      
      // Invia l'aggiornamento attraverso la callback
      onUpdatePlaytime(newTotalHours);
      
      // Chiudi il popover
      setIsEditingHours(false);
    }
  };
  
  const handleCancelPlaytime = () => {
    setIsEditingHours(false);
  };

  // Verifica se il gioco è stato completato o platinato
  const isCompleted = game.status === "completed";
  const isPlatinum = game.status === "platinum";
  const hasBeenCompleted = isCompleted || isPlatinum; // Sia i completati che i platinati sono stati completati

  return (
    <div className="bg-primaryBg border border-border-color rounded-xl p-6 mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-primary font-semibold text-xl text-text-primary">
          Informazioni
        </h2>
        {onEdit && (
          <Pencil 
            className="w-5 h-5 text-text-secondary hover:text-accent-primary cursor-pointer" 
            onClick={onEdit}
          />
        )}
      </div>

      {/* Stato */}
      <div className="flex justify-between items-center py-3 border-b border-border-color">
        <span className="font-secondary font-medium text-sm text-text-secondary">
          Stato
        </span>
        <StatusBadge status={game.status} />
      </div>

      {/* Piattaforma */}
      <div className="flex justify-between items-center py-3 border-b border-border-color">
        <span className="font-secondary font-medium text-sm text-text-secondary">
          Piattaforma
        </span>
        <span className="font-secondary text-base text-text-primary">
          {game.platform}
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
          {game.price ? `${game.price.toFixed(2)} €` : 'Non specificato'}
        </span>
      </div>

      {/* Data di acquisto */}
      <div className="flex justify-between items-center py-3 border-b border-border-color">
        <span className="font-secondary font-medium text-sm text-text-secondary">
          Data di acquisto
        </span>
        <span className="font-secondary text-base text-text-primary">
          {game.purchaseDate ? new Date(game.purchaseDate).toLocaleDateString('it-IT') : 'Non specificata'}
        </span>
      </div>

      {/* Data di completamento - Mostrata per giochi completati E platinati */}
      {hasBeenCompleted && game.completionDate && (
        <div className="flex justify-between items-center py-3 border-b border-border-color">
          <span className="font-secondary font-medium text-sm text-text-secondary">
            Data di completamento
          </span>
          <span className="font-secondary text-base text-text-primary">
            {new Date(game.completionDate).toLocaleDateString('it-IT')}
          </span>
        </div>
      )}

      {/* Data di platino - Mostrata solo per giochi platinati */}
      {isPlatinum && game.platinumDate && (
        <div className="flex justify-between items-center py-3 border-b border-border-color">
          <span className="font-secondary font-medium text-sm text-text-secondary">
            Data di platino
          </span>
          <span className="font-secondary text-base text-text-primary">
            {new Date(game.platinumDate).toLocaleDateString('it-IT')}
          </span>
        </div>
      )}
      
      {/* Valutazione */}
      <div className="py-3">
        <div className="flex justify-between items-center">
          <span className="font-secondary font-medium text-sm text-text-secondary">
            La tua valutazione
          </span>
          <RatingStars rating={game.rating} showValue={false} size="md" />
        </div>
      </div>
    </div>
  );
};

export default GameInfoCard;
