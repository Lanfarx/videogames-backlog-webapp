import React from 'react';
import { Clock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useGameById } from '../../utils/gamesHooks';
import RatingStars from './atoms/RatingStars';
import GenreTagList from './GenreTagList';

interface GameCardProps {
  id: string;
  title: string;
  coverImage?: string;
  platform: string;
  hoursPlayed: number;
  rating?: number;
  genres: string[];
}

const InProgressGameCard: React.FC<GameCardProps> = ({ 
  id,
  title, 
  coverImage, 
  platform, 
  hoursPlayed, 
  rating,
  genres = []
}) => {
  const navigate = useNavigate();
  // Ottieni il gioco aggiornato dallo stato globale Redux tramite hook custom
  const gameFromStore = useGameById(Number(id));
  const currentRating = gameFromStore?.rating ?? rating ?? 0;
  const currentHours = gameFromStore?.hoursPlayed ?? hoursPlayed;
  
  // Funzione per navigare alla pagina del gioco con il popover delle ore aperto
  const handleResumeGame = () => {
    navigate(`/game/${id}?addPlaytime=true`);
  };
  
  return (
    <div className="w-[280px] h-[280px] bg-primaryBg border border-border-color rounded-lg shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-accent-primary transition-all flex flex-col">
      {/* Immagine di copertina con link */}
      <Link to={`/game/${id}`} className="block h-[140px] w-full relative">
        <div className="absolute inset-0 bg-accent-secondary bg-opacity-20 rounded-t-lg"></div>
        <img src={coverImage || "/placeholder.svg"} alt={title} className="w-full h-full object-cover rounded-t-lg" /> 
      </Link>
      
      {/* Contenuto */}
      <div className="p-4 flex flex-col justify-between flex-grow">
        <div>
          <h3 className="text-base font-semibold text-text-primary truncate font-primary">{title}</h3>
          
          <div className="flex items-center mt-1 text-xs text-text-secondary font-secondary">
            <span>{platform}</span>
            <span className="mx-2">|</span>
            <Clock className="h-3 w-3 mr-1" />
            <span>{currentHours} ore</span>
          </div>
        </div>
        
        {/* Area info aggiuntive e stato */}
        <div className="mt-auto">
          <div className="flex items-center justify-between mb-2">
            <GenreTagList genres={genres} maxDisplay={2} small={true} />
            
            {(currentRating > 0) ? (
              <RatingStars rating={currentRating} showValue={false} size="sm" />
            ) : (
              <span className="text-xs text-text-disabled font-secondary">Non presente</span>
            )}
          </div>
          
          {/* Pulsante Riprendi che naviga direttamente alla pagina del gioco con flag per aprire il popover */}
          <button 
            className="text-sm font-medium text-accent-primary hover:text-accent-primary/80 font-secondary"
            onClick={handleResumeGame}
          >
            Riprendi
          </button>
        </div>
      </div>
    </div>
  );
};

export default InProgressGameCard;
