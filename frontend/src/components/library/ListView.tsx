import React, { useState } from 'react';
import { Monitor, Clock, Calendar, MoreVertical } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Game, GameStatus, GameFilters, SortOption, SortOrder } from '../../types/game';
import RatingStars from '../ui/atoms/RatingStars';
import StatusBadge from '../ui/atoms/StatusBadge';
import ThreeDotsModal from '../ui/ThreeDotsModal';
import { formatPrice, formatPurchaseDate, formatMetacriticScore } from '../../utils/gameDisplayUtils';

// Interfaccia per i parametri di navigazione
interface NavigationParams {
  filters: GameFilters;
  sortBy: SortOption;
  sortOrder: SortOrder;
  search: string;
}

interface ListViewProps {
  games: Game[];
  onEdit?: (game: Game) => void;
  onDelete?: (GameId: string) => void;
  onStatusChange?: (GameId: string, Status: GameStatus) => void;
  navigationParams?: NavigationParams;
}

const ListView: React.FC<ListViewProps> = ({ games, onEdit, onDelete, onStatusChange, navigationParams }) => {
  const [activeActionMenu, setActiveActionMenu] = useState<string | null>(null);  return (
    <div className="overflow-x-auto w-full min-w-0 library-list-view">
      <table className="w-full min-w-[800px] border-collapse">
        <thead>
          <tr className="bg-secondary-bg">
            <th className="text-left p-3 font-roboto font-medium text-sm text-text-secondary border-b border-border-color">
              Titolo
            </th>
            <th className="text-left p-3 font-roboto font-medium text-sm text-text-secondary border-b border-border-color">
              Piattaforma
            </th>
            <th className="text-left p-3 font-roboto font-medium text-sm text-text-secondary border-b border-border-color">
              Ore
            </th>
            <th className="text-left p-3 font-roboto font-medium text-sm text-text-secondary border-b border-border-color">
              Stato
            </th>
            <th className="text-left p-3 font-roboto font-medium text-sm text-text-secondary border-b border-border-color">
              Metacritic
            </th>
            <th className="text-left p-3 font-roboto font-medium text-sm text-text-secondary border-b border-border-color">
              Valutazione
            </th>
            <th className="text-left p-3 font-roboto font-medium text-sm text-text-secondary border-b border-border-color">
              Prezzo
            </th>
            <th className="text-left p-3 font-roboto font-medium text-sm text-text-secondary border-b border-border-color">
              Data Acquisto
            </th>
            <th className="text-left p-3 font-roboto font-medium text-sm text-text-secondary border-b border-border-color">
              Data Completamento
            </th>
            <th className="text-left p-3 font-roboto font-medium text-sm text-text-secondary border-b border-border-color">
              Data Platino
            </th>
            <th className="text-left p-3 font-roboto font-medium text-sm text-text-secondary border-b border-border-color">
              Azioni
            </th>
          </tr>
        </thead>
        <tbody>
          {games.map((game, index) => (
            <tr
              key={game.id}
              className={`hover:bg-tertiary-bg transition-colors ${
                index % 2 === 0 ? "bg-primary-bg" : "bg-secondary-bg/30"
              }`}
            >
              <td className="p-3 border-b border-border-color">
                <div className="flex items-center">
                  <div className="h-12 w-12 mr-3 overflow-hidden rounded relative">
                    <div className="absolute inset-0 bg-accent-secondary/20 z-10"></div>
                    <img
                      src={game.CoverImage || "/placeholder.svg"}
                      alt={game.Title}
                      className="h-full w-full object-cover"
                    />
                  </div>                  <Link 
                    to={`/library/${game.Title}`} 
                    state={{ navigationParams }}
                    className="font-montserrat font-medium text-sm text-text-primary hover:text-accent-primary transition-colors"
                  >
                    {game.Title}
                  </Link>
                </div>
              </td>
              <td className="p-3 border-b border-border-color font-roboto text-sm text-text-secondary">
                <div className="flex items-center">
                  <Monitor className="h-4 w-4 mr-1" />
                  {game.Platform}
                </div>
              </td>
              <td className="p-3 border-b border-border-color font-roboto text-sm text-text-secondary">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {game.HoursPlayed} ore
                </div>
              </td>
              <td className="p-3 border-b border-border-color">
                <StatusBadge Status={game.Status} />
              </td>              <td className="p-3 border-b border-border-color font-roboto text-sm text-text-secondary">  
                <div className="flex items-center">
                  <span className="font-bold text-accent-primary mr-1">{formatMetacriticScore(game.Metacritic)}</span>
                  {game.Metacritic && game.Metacritic > 0 && (
                    <span className="text-xs text-text-secondary">/ 100</span>
                  )}
                </div>
              </td>
              <td className="p-3 border-b border-border-color">
                {game.Rating > 0 ? (
                  <RatingStars Rating={game.Rating} showValue={false} size="sm" />
                ) : (
                  <span className="text-xs text-text-disabled">Non valutato</span>
                )}
              </td>              <td className="p-3 border-b border-border-color font-roboto text-sm text-text-secondary">
                {game.Price !== undefined ? formatPrice(game.Price) : "-"}
              </td>              <td className="p-3 border-b border-border-color font-roboto text-sm text-text-secondary">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {formatPurchaseDate(game.PurchaseDate, game.Platform)}
                </div>
              </td>
              <td className="p-3 border-b border-border-color font-roboto text-sm text-text-secondary">
                {game.CompletionDate ? (
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(game.CompletionDate).toLocaleDateString()}
                  </div>
                ) : (
                  "-"
                )}
              </td>
              <td className="p-3 border-b border-border-color font-roboto text-sm text-text-secondary">
                {game.PlatinumDate ? (
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(game.PlatinumDate).toLocaleDateString()}
                  </div>
                ) : (
                  "-"
                )}
              </td>
              <td className="p-3 border-b border-border-color">
                <div className="relative">
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

                  <ThreeDotsModal
                    isOpen={activeActionMenu === game.id.toString()}
                    onClose={() => setActiveActionMenu(null)}
                    game={game}
                    position="top-right"
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onStatusChange={onStatusChange}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ListView;