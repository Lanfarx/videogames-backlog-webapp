import React from 'react';
import { Clock } from 'lucide-react';
import RatingStars from './atoms/RatingStars';
import GenreTagList from './GenreTagList';
import { calculateRatingFromReview } from '../../utils/gamesData';

interface GameCardProps {
  title: string;
  coverImage?: string; // Reso opzionale
  platform: string;
  hoursPlayed: number;
  rating?: number; // Rating da 0 a 5, opzionale
  genres: string[]; // Array dei generi del gioco
  review?: {
    gameplay: number;
    graphics: number;
    story: number;
    sound: number;
    text: string;
    date: string;
  }; // Recensione per calcolare il rating
}

const GameCard: React.FC<GameCardProps> = ({ 
  title, 
  coverImage, 
  platform, 
  hoursPlayed, 
  rating = 0,
  genres = [], // Default a array vuoto
  review
}) => {
  // Se c'è una recensione, calcoliamo il rating da essa, altrimenti usiamo il rating passato
  const effectiveRating = review ? calculateRatingFromReview(review) : rating;
  
  return (
    <div className="w-[280px] h-[280px] bg-primaryBg border border-border-color rounded-lg shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-accent-primary transition-all flex flex-col">
      {/* Immagine di copertina */}
      <div 
        className="h-[140px] w-full bg-cover bg-center rounded-t-lg relative"
      >
       <div className="absolute inset-0 bg-accent-secondary bg-opacity-20 rounded-t-lg"></div>
       <img src={coverImage || "/placeholder.svg"} alt={title} className="w-full h-full object-cover" /> 
      </div>
      
      {/* Contenuto */}
      <div className="p-4 flex flex-col justify-between flex-grow">
        <div>
          <h3 className="text-base font-semibold text-text-primary truncate font-primary">{title}</h3>
          
          <div className="flex items-center mt-1 text-xs text-text-secondary font-secondary">
            <span>{platform}</span>
            <span className="mx-2">|</span>
            <Clock className="h-3 w-3 mr-1" />
            <span>{hoursPlayed} ore</span>
          </div>
        </div>
        
        {/* Area info aggiuntive e stato */}
        <div className="mt-auto">
          <div className="flex items-center justify-between mb-2">
            {/* Utilizziamo GenreTagList per mostrare i generi */}
            <GenreTagList genres={genres} maxDisplay={2} small={true} />
            
            {/* Utilizziamo RatingStars invece di renderRating */}
            {effectiveRating > 0 ? (
              <RatingStars rating={effectiveRating} showValue={false} size="sm" />
            ) : (
              <span className="text-xs text-text-disabled font-secondary">Non presente</span>
            )}
          </div>
          
          {/* Pulsante - sempre posizionato in basso */}
          <button className="text-sm font-medium text-accent-primary hover:text-accent-primary/80 font-secondary">
            Riprendi
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameCard;
