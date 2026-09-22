import { useState, useEffect, useRef } from 'react';
import { Clock, Pencil, Download, AlertCircle } from 'lucide-react';
import { Game } from '../../types/game';
import RatingStars from '../ui/atoms/RatingStars';
import StatusBadge from '../ui/atoms/StatusBadge';
import PlaytimePopover from '../ui/PlaytimePopover';
import EditGameInfoModal from './EditGameInfoModal';
import { useGameById } from '../../store/hooks/gamesHooks';
import { getGameRating } from '../../utils/gamesUtils';
import { formatPrice, formatPurchaseDate } from '../../utils/gameDisplayUtils';
import { useRAWGUpdate } from '../../hooks/useRAWGUpdate';

interface GameInfoCardProps {
  game: Game;
  onEditInfo?: (updatedGame: Partial<Game>) => void;
  onUpdatePlaytime?: (newHours: number) => void;
}

const GameInfoCard = ({ game, onEditInfo, onUpdatePlaytime }: GameInfoCardProps) => {
  const [isEditingHours, setIsEditingHours] = useState(false);
  const [showEditInfoModal, setShowEditInfoModal] = useState(false);
  
  const currentGame = useGameById(game.id) || game;
  const calculatedRating = currentGame.Rating ?? getGameRating(currentGame);
  const disPlayedHours = currentGame.HoursPlayed;
  
  const prevRatingRef = useRef(calculatedRating);
  
  const { isUpdating, updateFromRAWG, missingData } = useRAWGUpdate(currentGame, onEditInfo);

  useEffect(() => {
    prevRatingRef.current = calculatedRating;
  }, [calculatedRating]);
  
  const handleSavePlaytime = () => setIsEditingHours(false);
  const handleCancelPlaytime = () => setIsEditingHours(false);
  const handleEditInfoClick = () => setShowEditInfoModal(true);

  const handleUpdateFromRAWG = async () => {
    try {
      const success = await updateFromRAWG();
      if (!success) {
        console.warn('Nessun dato aggiuntivo trovato su RAWG per questo gioco');
      }
    } catch (error) {
      // Error handled in hook
    }
  };

  const isCompleted = currentGame.Status === "Completed"; 
  const isPlatinum = currentGame.Status === "Platinum";
  const hasBeenCompleted = isCompleted || isPlatinum;
  
  const showRAWGButton = onEditInfo && missingData;

  return (
    <div className="bg-primary-bg border border-border-color rounded-xl p-6 mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-primary font-semibold text-xl text-text-primary">
          Informazioni
        </h2>
        <div className="flex items-center space-x-2">
          {showRAWGButton && (
            <button
              onClick={handleUpdateFromRAWG}
              disabled={isUpdating}
              className="flex items-center space-x-1 px-2 py-1 text-xs bg-accent-secondary/10 
                         text-accent-secondary hover:bg-accent-secondary/20 rounded-md 
                         transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Aggiorna dati mancanti da RAWG"
            >
              {isUpdating ? (
                <>
                  <div className="w-3 h-3 border border-accent-secondary border-t-transparent rounded-full animate-spin" />
                  <span>Aggiornando...</span>
                </>
              ) : (
                <>
                  <Download className="w-3 h-3" />
                  <span>Aggiorna dati</span>
                </>
              )}
            </button>
          )}

          {missingData && (
            <div title="Alcuni dati del gioco sono mancanti">
              <AlertCircle className="w-4 h-4 text-yellow-500" />
            </div>
          )}
          
          {onEditInfo && (
            <Pencil 
              className="w-5 h-5 text-text-secondary hover:text-accent-primary cursor-pointer" 
              onClick={handleEditInfoClick}
            />
          )}
        </div>
      </div>

      <div className="flex justify-between items-center py-3 border-b border-border-color">
        <span className="font-secondary font-medium text-sm text-text-secondary">Stato</span>
        <StatusBadge Status={currentGame.Status} />
      </div>

      <div className="flex justify-between items-center py-3 border-b border-border-color">
        <span className="font-secondary font-medium text-sm text-text-secondary">Piattaforma</span>
        <span className="font-secondary text-base text-text-primary">
          {currentGame.Platform || 'Non specificata'}
        </span>
      </div>

      <div className="flex justify-between items-center py-3 border-b border-border-color">
        <span className="font-secondary font-medium text-sm text-text-secondary">Tempo di gioco</span>
        <div className="flex items-center relative">
          <span className="font-secondary font-semibold text-lg text-text-primary">
            {disPlayedHours} ore
          </span>
          
          {onUpdatePlaytime && (
            <>
              <Clock 
                className="w-4 h-4 text-accent-primary cursor-pointer ml-2"
                onClick={() => setIsEditingHours(!isEditingHours)}
              />
              {isEditingHours && (
                <PlaytimePopover 
                  GameId={currentGame.id}
                  currentHours={disPlayedHours}
                  onSave={handleSavePlaytime}
                  onCancel={handleCancelPlaytime}
                />
              )}
            </>
          )}
        </div>
      </div>


      <div className="flex justify-between items-center py-3 border-b border-border-color">
        <span className="font-secondary font-medium text-sm text-text-secondary">
          {currentGame.Price === null || currentGame.Price === undefined ? 'Tipo acquisizione' : 'Prezzo'}
        </span>
        <span className="font-secondary text-base text-text-primary">
          {currentGame.Price !== undefined ? formatPrice(currentGame.Price, currentGame.Platform) : 'Non specificato'}
        </span>
      </div>

      <div className="flex justify-between items-center py-3 border-b border-border-color">
        <span className="font-secondary font-medium text-sm text-text-secondary">
          {currentGame.Price === 0 ? 'Data di ottenimento' : (currentGame.Price === null || currentGame.Price === undefined ? 'Data di aggiunta' : 'Data di acquisto')}
        </span>
        <span className="font-secondary text-base text-text-primary">
          {formatPurchaseDate(currentGame.PurchaseDate, currentGame.Platform)}
        </span>
      </div>

      {hasBeenCompleted && currentGame.CompletionDate && (
        <div className="flex justify-between items-center py-3 border-b border-border-color">
          <span className="font-secondary font-medium text-sm text-text-secondary">Data di completamento</span>
          <span className="font-secondary text-base text-text-primary">
            {new Date(currentGame.CompletionDate).toLocaleDateString('it-IT')}
          </span>
        </div>
      )}

      {isPlatinum && currentGame.PlatinumDate && (
        <div className="flex justify-between items-center py-3 border-b border-border-color">
          <span className="font-secondary font-medium text-sm text-text-secondary">Data di platino</span>
          <span className="font-secondary text-base text-text-primary">
            {new Date(currentGame.PlatinumDate).toLocaleDateString('it-IT')}
          </span>
        </div>
      )}
      
      <div className="py-3">
        <div className="flex justify-between items-center">
          <span className="font-secondary font-medium text-sm text-text-secondary">La tua valutazione</span>
          {calculatedRating === 0 ? (
            <span className="font-secondary text-base text-text-secondary italic">Non valutato</span>
          ) : (
            <RatingStars Rating={calculatedRating} showValue={false} size="md" />
          )}
        </div>
      </div>
      
      <EditGameInfoModal
        isOpen={showEditInfoModal}
        onClose={() => setShowEditInfoModal(false)}
        game={currentGame}
      />
    </div>
  );
};

export default GameInfoCard;
