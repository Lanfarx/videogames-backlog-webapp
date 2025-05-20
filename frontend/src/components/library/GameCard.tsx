import React, { useState } from 'react';
import { Monitor, Clock, MoreVertical, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Game, GameStatus } from '../../types/game';
import { getGameRating } from '../../utils/gamesData';
import RatingStars from '../ui/atoms/RatingStars';
import StatusBadge from '../ui/atoms/StatusBadge';
import { getStatusColor } from '../../utils/statusData';
import ThreeDotsModal from '../ui/ThreeDotsModal';

interface GameCardProps {
  game: Game;
  onEdit?: (game: Game) => void;
  onDelete?: (gameId: string) => void;
  onStatusChange?: (gameId: string, status: GameStatus) => void;
}

const GameCard: React.FC<GameCardProps> = ({ game, onEdit, onDelete, onStatusChange }) => {
  const effectiveRating = getGameRating(game);
  const [activeActionMenu, setActiveActionMenu] = useState<string | null>(null);

  return (
    <div className="bg-primary-bg border border-border-color rounded-xl shadow-sm hover:shadow-md hover:border-accent-primary hover:translate-y-[-2px] transition-all h-[360px] relative">
      {/* Indicatore di stato */}
      <div className="h-1 bg-border-color rounded-t-xl overflow-hidden">
        <div className="h-full" style={{ backgroundColor: `${getStatusColor(game.status)}20`, width: "100%" }}></div>
      </div>

      {/* Copertina con link */}
      <Link to={`/game/${game.id}`} className="block">
        <div className="relative h-[180px] overflow-hidden">
          <div className="absolute inset-0 bg-accent-secondary/20 z-10"></div>
          <img src={game.coverImage || "/placeholder.svg"} alt={game.title} className="w-full h-full object-cover" />
        </div>
      </Link>

      {/* Contenuto */}
      <div className="p-4">
        <Link to={`/gioco/${game.id}`} className="block">
          <h3 className="font-montserrat font-semibold text-base text-text-primary line-clamp-2 h-12 hover:text-accent-primary transition-colors">
            {game.title}
          </h3>
        </Link>

        <div className="flex items-center mt-2 text-text-secondary">
          <Monitor className="h-4 w-4 mr-1" />
          <span className="font-roboto text-xs">{game.platform}</span>
          <span className="mx-2">|</span>
          <Clock className="h-4 w-4 mr-1" />
          <span className="font-roboto text-xs">{game.hoursPlayed} ore</span>
          {game.metacritic && (
            <>
              <span className="mx-2">|</span>
              <Award className="h-4 w-4 mr-1 text-yellow-500" />
              <span className="font-roboto text-xs">{game.metacritic}</span>
            </>
          )}
        </div>

        {/* Prezzo e Data di acquisto */}
        <div className="mt-2 flex items-center justify-between text-text-secondary">
          {game.purchaseDate && (
            <span className="font-roboto text-xs">
              Acquistato il: {new Date(game.purchaseDate).toLocaleDateString()}
            </span>
          )}
          {game.price > 0 && (
            <span className="font-roboto text-xs">{game.price.toFixed(2)} €</span>
          )}
        </div>

        {/* Stato e Valutazione */}
        <div className="mt-2 flex items-center justify-between">
          <StatusBadge status={game.status} />
          {effectiveRating > 0 && (
            <RatingStars rating={effectiveRating} showValue={false} size="sm" />
          )}
        </div>
      </div>

      {/* Menu azioni */}
      <div className="absolute top-2 right-2 z-20">
        <ThreeDotsModal
          isOpen={activeActionMenu === game.id.toString()}
          onClose={() => setActiveActionMenu(null)}
          game={game}
          position="top-right"
          onEdit={onEdit}
          onDelete={onDelete}
          onStatusChange={onStatusChange}
        />
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setActiveActionMenu(activeActionMenu === game.id.toString() ? null : game.id.toString());
          }}
          className="p-1 rounded-full text-text-secondary hover:text-accent-primary transition-colors"
        >
          <MoreVertical className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default GameCard;