import React, { useState } from 'react';
import { Monitor, Clock, Calendar, MoreVertical, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Game, GameStatus } from '../../types/game';
import RatingStars from '../ui/atoms/RatingStars';
import StatusBadge from '../ui/atoms/StatusBadge';
import ThreeDotsModal from '../ui/ThreeDotsModal';

interface ListViewProps {
  games: Game[];
  onEdit?: (game: Game) => void;
  onDelete?: (gameId: string) => void;
  onStatusChange?: (gameId: string, status: GameStatus) => void;
}

const ListView: React.FC<ListViewProps> = ({ games, onEdit, onDelete, onStatusChange }) => {
  const [activeActionMenu, setActiveActionMenu] = useState<string | null>(null);

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
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
                      src={game.coverImage || "/placeholder.svg"}
                      alt={game.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <Link to={`/game/${game.id}`} className="font-montserrat font-medium text-sm text-text-primary hover:text-accent-primary transition-colors">
                    {game.title}
                  </Link>
                </div>
              </td>
              <td className="p-3 border-b border-border-color font-roboto text-sm text-text-secondary">
                <div className="flex items-center">
                  <Monitor className="h-4 w-4 mr-1" />
                  {game.platform}
                </div>
              </td>
              <td className="p-3 border-b border-border-color font-roboto text-sm text-text-secondary">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {game.hoursPlayed} ore
                </div>
              </td>
              <td className="p-3 border-b border-border-color">
                <StatusBadge status={game.status} />
              </td>
              <td className="p-3 border-b border-border-color font-roboto text-sm text-text-secondary">
                {game.metacritic ? (
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 text-accent-primary" />
                    <span className="font-bold text-accent-primary">{game.metacritic}</span>
                    <span className="text-xs text-text-secondary">/ 100</span>
                  </div>
                ) : (
                  <span className="text-xs text-text-disabled">Non disponibile</span>
                )}
              </td>
              <td className="p-3 border-b border-border-color">
                {game.rating > 0 ? (
                  <RatingStars rating={game.rating} showValue={false} size="sm" />
                ) : (
                  <span className="text-xs text-text-disabled">Non valutato</span>
                )}
              </td>
              <td className="p-3 border-b border-border-color font-roboto text-sm text-text-secondary">
                {game.price > 0 ? `${game.price.toFixed(2)} €` : "-"}
              </td>
              <td className="p-3 border-b border-border-color font-roboto text-sm text-text-secondary">
                {game.purchaseDate ? (
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(game.purchaseDate).toLocaleDateString()}
                  </div>
                ) : (
                  "-"
                )}
              </td>
              <td className="p-3 border-b border-border-color font-roboto text-sm text-text-secondary">
                {game.completionDate ? (
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(game.completionDate).toLocaleDateString()}
                  </div>
                ) : (
                  "-"
                )}
              </td>
              <td className="p-3 border-b border-border-color font-roboto text-sm text-text-secondary">
                {game.platinumDate ? (
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(game.platinumDate).toLocaleDateString()}
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