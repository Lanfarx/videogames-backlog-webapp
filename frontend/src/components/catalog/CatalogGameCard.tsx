// Spostato da library/CatalogGameCard.tsx
import React from "react";
import { CheckCircle, PlusCircle, Award} from "lucide-react";
import type { SampleGame } from "../../types/game";
import RatingStars from '../ui/atoms/RatingStars';
import { useNavigate } from "react-router-dom";
import { useGameReviewsStats } from "../../store/hooks/gamesHooks";

interface CatalogGameCardProps {
  game: SampleGame;
  isInLibrary: boolean;
  onAddToLibrary: () => void;
  userReview?: { rating: number; positive: boolean } | null;
}

const CatalogGameCard: React.FC<CatalogGameCardProps> = ({ game, isInLibrary, onAddToLibrary, userReview }) => {
  const { avg, count } = useGameReviewsStats(game.title);
  const navigate = useNavigate();

  // Sostituisci gli spazi con _ per la URL
  const handleInfoClick = () => {
    const urlTitle = game.title.replace(/\s+/g, '_');
    navigate(`/catalog/${urlTitle}`);
  };

  return (
    <div className="bg-primary-bg border border-border-color rounded-xl shadow-sm hover:shadow-md transition-all h-full flex flex-col relative p-3 xl:p-2">
      {/* Icona se già in libreria rimossa, ora solo nel bottone */}
      <img
        src={game.coverImage || "/placeholder.svg"}
        alt={game.title}
        className="w-full h-36 object-cover rounded-lg mb-2"
      />
      <div className="flex-1 flex flex-col gap-1">
        <h3 className="font-bold text-base text-text-primary mb-0.5 line-clamp-1">{game.title}</h3>
        <div className="text-xs text-text-secondary mb-0.5 flex flex-wrap items-center gap-1">
          <span>{game.developer}</span>
          <span className="mx-1">·</span>
          <span>{game.releaseYear}</span>
        </div>
        <div className="flex flex-wrap gap-1 mb-1">
          {game.genres.slice(0, 3).map((g) => (
            <span key={g} className="px-2 py-0.5 bg-tertiary-bg text-xs rounded-full text-text-secondary">{g}</span>
          ))}
          {game.genres.length > 3 && (
            <span className="px-2 py-0.5 bg-tertiary-bg text-xs rounded-full text-text-secondary">+{game.genres.length - 3}</span>
          )}
        </div>
        <div className="flex items-center gap-2 mb-1">
          <Award className="h-4 w-4 text-yellow-400" />
          <span className="font-semibold text-xs text-text-primary">{game.metacritic}</span>
          <span className="text-xs text-text-secondary">Metacritic</span>
        </div>
        {/* Recensioni utenti aggregate */}
        <div className="flex items-center gap-2 mb-1">
          <RatingStars rating={avg} showValue={false} size="sm" readOnly />
          <span className="text-xs text-text-secondary">
            {count > 0 ? `${avg.toFixed(1)} / 5 (${count} recensioni)` : 'Nessuna recensione utente'}
          </span>
        </div>
        <div className="flex-1" />
        {/* Pulsanti azione */}
        <div className="flex gap-2 mt-2">
          {!isInLibrary ? (
            <button
              className="flex-1 flex items-center justify-center gap-2 py-1.5 px-2 bg-accent-primary text-white rounded-md font-medium text-xs hover:bg-accent-primary/90 transition-colors shadow-sm"
              onClick={onAddToLibrary}
            >
              <PlusCircle className="h-4 w-4" />
              Aggiungi
            </button>
          ) : (
            <button
              className="flex-1 flex items-center justify-center gap-2 py-1.5 px-2 bg-accent-success/20 text-accent-success rounded-md font-medium text-xs cursor-default shadow-sm border border-accent-success/40"
              disabled
            >
              <CheckCircle className="h-4 w-4" />
              In libreria
            </button>
          )}
          <button
            className="flex items-center justify-center gap-1 py-1.5 px-2 bg-primary-bg border border-border-color rounded-md text-xs text-text-secondary hover:bg-tertiary-bg transition-colors shadow-sm"
            title="Vedi dettagli gioco"
            onClick={handleInfoClick}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" /></svg>
            Info
          </button>
        </div>
      </div>
    </div>
  );
};

export default CatalogGameCard;
