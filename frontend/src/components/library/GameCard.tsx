import React, { useState } from 'react';
import { Monitor, Clock, MoreVertical, Award, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Game, GameStatus, GameFilters, SortOption, SortOrder } from '../../types/game';
import type { LibrarySelection } from './librarySelection';
import RatingStars from '../ui/atoms/RatingStars';
import StatusBadge from '../ui/atoms/StatusBadge';
import { useGameById } from '../../store/hooks/index';
import { getGameRating, formatAchievements } from '../../utils/gamesUtils';
import ThreeDotsModal from '../ui/ThreeDotsModal';
import StatusIndicator from '../ui/atoms/StatusIndicator';
import { formatPrice, formatPurchaseDate, formatPurchaseDateWithLabel, formatMetacriticScore } from '../../utils/gameDisplayUtils';

// Interfaccia per i parametri di navigazione
interface NavigationParams {
  filters: GameFilters;
  sortBy: SortOption;
  sortOrder: SortOrder;
  search: string;
}

interface GameCardProps {
  game: Game;
  onEdit?: (game: Game) => void;
  onDelete?: (GameId: string) => void;
  onStatusChange?: (GameId: string, Status: GameStatus) => void;
  navigationParams?: NavigationParams;
  selection?: LibrarySelection;
}

export default function GameCard({ game, onEdit, onDelete, onStatusChange, navigationParams, selection }: GameCardProps) {
  // Ottieni il gioco aggiornato dallo stato globale Redux
  const currentGame = useGameById(game.id) || game;
  const effectiveRating = currentGame.Rating ?? getGameRating(currentGame);
  const effectiveHours = currentGame.HoursPlayed;
  const achievements = formatAchievements(currentGame);
  const [activeActionMenu, setActiveActionMenu] = useState<string | null>(null);
  const isSelected = selection?.selectedIds.has(game.id) ?? false;

  return (
    <div className={`group bg-primary-bg border rounded-xl shadow-sm hover:shadow-md hover:border-accent-primary hover:translate-y-[-2px] transition-all h-[360px] relative ${isSelected ? 'border-accent-primary ring-2 ring-accent-primary' : 'border-border-color'}`}>
      {/* Indicatore di stato */}
      <StatusIndicator Status={currentGame.Status} />      {/* Copertina con link */}
      <Link 
        to={`/library/${encodeURIComponent(game.Title.replace(/ /g, '_'))}`} 
        state={{ navigationParams }}
        className="block"
      >
        <div className="relative h-[180px] overflow-hidden">
          <div className="absolute inset-0 bg-accent-secondary/20 z-10"></div>
          <img
            src={game.CoverImage || "/placeholder.svg"}
            alt={game.Title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover"
          />
        </div>
      </Link>

      {/* Contenuto */}
      <div className="p-4">
        <Link 
          to={`/library/${encodeURIComponent(game.Title.replace(/ /g, '_'))}`} 
          state={{ navigationParams }}
          className="block"
        >
          <h3 className="font-montserrat font-semibold text-base text-text-primary line-clamp-2 h-12 hover:text-accent-primary transition-colors">
            {game.Title}
          </h3>
        </Link>        <div className="flex items-center mt-2 text-text-secondary">
          <Monitor className="h-4 w-4 mr-1" />
          <span className="font-roboto text-xs">{game.Platform}</span>
          <span className="mx-2">|</span>
          <Clock className="h-4 w-4 mr-1" />
          <span className="font-roboto text-xs">{effectiveHours} ore</span>
          <span className="mx-2">|</span>
          <Award className="h-4 w-4 mr-1 text-yellow-500" />
          <span className="font-roboto text-xs">{formatMetacriticScore(game.Metacritic)}</span>
        </div>        <div className="mt-2 flex items-center justify-between text-text-secondary">
          <span className="font-roboto text-xs">
            {formatPurchaseDateWithLabel(game.PurchaseDate, game.Platform, game.Price)}
          </span>
          {game.Price !== undefined && game.Price !== -1 && !(game.Price === 0 && !game.PurchaseDate) && (
            <span className="font-roboto text-xs">{formatPrice(game.Price, game.Platform)}</span>
          )}
        </div>

        {/* Stato e Valutazione */}
        <div className="mt-2 flex items-center justify-between">
          <StatusBadge Status={currentGame.Status} />
          {achievements && (
            <span className="flex items-center font-roboto text-xs text-text-secondary" title="Achievement Steam sbloccati">
              <Trophy className="h-3.5 w-3.5 mr-1" />{achievements}
            </span>
          )}
          {effectiveRating > 0 && (
            <RatingStars Rating={effectiveRating} showValue={false} size="sm" />
          )}
        </div>
      </div>

      {selection && (
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => selection.onToggle(game.id)}
          aria-label={`Seleziona ${game.Title}`}
          className={`absolute top-4 left-3 z-20 h-5 w-5 cursor-pointer accent-accent-primary ${selection.selectedIds.size > 0 ? '' : 'opacity-0 group-hover:opacity-100 focus:opacity-100'}`}
        />
      )}

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
          className="w-11 h-11 flex items-center justify-center rounded-full text-text-secondary hover:text-accent-primary hover:bg-primary-bg/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
          aria-label={`Opzioni per ${game.Title}`}
        >
          <MoreVertical className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}