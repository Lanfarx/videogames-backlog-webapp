import React from 'react';
import { Clock } from 'lucide-react';

interface GameCardProps {
  title: string;
  coverImage: string;
  platform: string;
  hoursPlayed: number;
  rating?: number; // Rating da 0 a 5, opzionale
  genres: string[]; // Array dei generi del gioco
}

const GameCard: React.FC<GameCardProps> = ({ 
  title, 
  coverImage, 
  platform, 
  hoursPlayed, 
  rating,
  genres = [] // Default a array vuoto
}) => {
  const renderGenres = () => {
    if (!genres.length) return null;
    
    const displayedGenres = genres.slice(0, 2);
    
    return (
      <div className="flex flex-wrap gap-1">
        {displayedGenres.map((genre, index) => (
          <span 
            key={index} 
            className="px-2 py-0.5 text-xs rounded-full bg-tertiaryBg text-text-secondary font-secondary"
          >
            {genre}
          </span>
        ))}
      </div>
    );
  };

  // Funzione per generare le stelline in base al rating
  const renderRating = () => {
    if (!rating) {
      return <span className="text-xs text-text-disabled font-secondary">Non presente</span>;
    }
    
    // Arrotondiamo il rating al mezzo punto più vicino (0, 0.5, 1, 1.5, ...)
    const roundedRating = Math.round(rating * 2) / 2;
    const fullStars = Math.floor(roundedRating);
    const halfStar = roundedRating % 1 !== 0;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    return (
      <div className="flex text-accent-secondary">
        {[...Array(fullStars)].map((_, i) => <span key={`full-${i}`}>★</span>)}
        {halfStar && <span>½</span>}
        {[...Array(emptyStars)].map((_, i) => <span key={`empty-${i}`}>☆</span>)}
      </div>
    );
  };
  
  return (
    <div className="w-[280px] h-[280px] bg-primaryBg border border-border-color rounded-lg shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-accent-primary transition-all flex flex-col">
      {/* Immagine di copertina */}
      <div 
        className="h-[140px] w-full bg-cover bg-center rounded-t-lg relative"
        style={{ backgroundImage: `url(${coverImage})` }}
      >
        <div className="absolute inset-0 bg-accent-secondary bg-opacity-20 rounded-t-lg"></div>
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
            {/* Generi del gioco */}
            {renderGenres()}
            
            {/* Rating stelline dinamico */}
            {renderRating()}
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
