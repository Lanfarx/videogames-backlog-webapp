import { Clock, Pencil } from 'lucide-react';
import { Game } from '../../types/game';
import RatingStars from '../ui/atoms/RatingStars';
import StatusBadge from '../ui/atoms/StatusBadge';

interface GameInfoCardProps {
  game: Game;
  onEdit?: () => void;
  onUpdatePlaytime?: () => void;
}

const GameInfoCard = ({ game, onEdit, onUpdatePlaytime }: GameInfoCardProps) => {
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
        <div className="flex items-center">
          <span className="font-secondary font-semibold text-lg text-text-primary">
            {game.hoursPlayed} ore
          </span>
          {onUpdatePlaytime && (
            <Clock 
              className="w-4 h-4 text-accent-primary cursor-pointer ml-2"
              onClick={onUpdatePlaytime} 
            />
          )}
        </div>
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

      {/* Prezzo */}
      <div className="flex justify-between items-center py-3 border-b border-border-color">
        <span className="font-secondary font-medium text-sm text-text-secondary">
          Prezzo
        </span>
        <span className="font-secondary text-base text-text-primary">
          {game.price ? `${game.price.toFixed(2)} €` : 'Non specificato'}
        </span>
      </div>
      
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
