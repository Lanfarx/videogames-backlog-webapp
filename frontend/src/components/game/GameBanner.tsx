import { useState } from 'react';
import { ChevronDown, Pencil, Trash2 } from 'lucide-react';
import { Game } from '../../types/game';
import { getStatusColor, getStatusLabel } from '../../utils/statusData';
import GameCover from './GameCover';
import GenreTagList from '../ui/GenreTagList';
import RatingStars from '../ui/atoms/RatingStars';
import StatusChangePopover from './ui/StatusChangePopover';

interface GameBannerProps {
  game: Game;
  onChangeStatus?: (newStatus: Game['status']) => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const GameBanner = ({ game, onChangeStatus, onEdit, onDelete }: GameBannerProps) => {
  // Ottieni l'etichetta in italiano per lo stato attuale
  const currentStatusLabel = getStatusLabel(game.status);
  const [showStatusPopover, setShowStatusPopover] = useState(false);
  
  const handleStatusChange = (newStatus: Game['status']) => {
    if (onChangeStatus) {
      onChangeStatus(newStatus);
      setShowStatusPopover(false);
    }
  };
  
  return (
    <section className="container mx-auto py-8 max-w-5xl">
      <div className="flex">
        {/* Copertina */}
        <div className="mr-20">
          <GameCover 
            coverImage={game.coverImage} 
            title={game.title} 
            status={game.status}
            size="xl"
          />
        </div>

        {/* Info gioco */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <h1 className="font-primary font-bold text-3xl text-text-primary mb-2">{game.title}</h1>
            <p className="font-secondary text-base text-text-secondary mb-2">
              {game.developer} / {game.publisher}
            </p>
            <p className="font-secondary text-sm text-text-secondary mb-4">
              {game.releaseYear}
            </p>
            
            {/* Generi - posizionati come nell'immagine */}
            <div className="mb-6">
              <GenreTagList genres={game.genres} maxDisplay={5} small={false} />
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
                  currentStatus={game.status}
                  onStatusChange={handleStatusChange}
                  onCancel={() => setShowStatusPopover(false)}
                  hoursPlayed={game.hoursPlayed} // Passiamo le ore di gioco
                />
              )}
            </div>
            <button 
              className="flex items-center px-4 py-2 bg-accent-success text-white rounded-lg font-secondary font-medium text-sm hover:bg-accent-success/90 transition-colors"
              onClick={onEdit}
            >
              <Pencil className="mr-2 w-4 h-4" />
              Modifica dettagli
            </button>
            <button 
              className="p-2 bg-primaryBg border border-border-color rounded-lg font-secondary text-sm hover:bg-secondaryBg transition-colors"
              onClick={onDelete}
            >
              <Trash2 className="w-5 h-5 text-accent-danger" />
            </button>
          </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GameBanner;
