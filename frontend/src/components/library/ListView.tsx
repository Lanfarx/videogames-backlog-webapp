import React from 'react';
import { Monitor, Clock, Calendar, MoreHorizontal } from 'lucide-react';
import type { Game } from '../../types/game';
import { STATUS_COLORS, STATUS_NAMES } from '../../constants/gameConstants';
import { formatDate } from '../../utils/gameUtils';
import RatingStars from '../ui/atoms/RatingStars';

interface ListViewProps {
  games: Game[];
}

const ListView: React.FC<ListViewProps> = ({ games }) => {
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
              Prezzo
            </th>
            <th className="text-left p-3 font-roboto font-medium text-sm text-text-secondary border-b border-border-color">
              Stato
            </th>
            <th className="text-left p-3 font-roboto font-medium text-sm text-text-secondary border-b border-border-color">
              Data di acquisto
            </th>
            <th className="text-left p-3 font-roboto font-medium text-sm text-text-secondary border-b border-border-color">
              Data di completamento
            </th>
            <th className="text-left p-3 font-roboto font-medium text-sm text-text-secondary border-b border-border-color">
              Data di platino
            </th>
            <th className="text-left p-3 font-roboto font-medium text-sm text-text-secondary border-b border-border-color">
              Rating
            </th>
            <th className="text-left p-3 font-roboto font-medium text-sm text-text-secondary border-b border-border-color">
              Azioni
            </th>
          </tr>
        </thead>
        <tbody>
          {games.map((game, index) => {
            const statusColor = STATUS_COLORS[game.status] || "#E0E0E0";
            const statusName = STATUS_NAMES[game.status] || "Sconosciuto";

            return (
              <tr
                key={game.id}
                className={`h-[72px] hover:bg-tertiary-bg transition-colors ${
                  index % 2 === 0 ? "bg-primary-bg" : "bg-secondary-bg/30"
                }`}
              >
                <td className="p-3 border-b border-border-color">
                  <div className="flex items-center">
                    <div className="relative h-12 w-12 mr-3 overflow-hidden rounded">
                      <div className="absolute inset-0 bg-accent-secondary/20 z-10"></div>
                      <img
                        src={game.coverImage || "/placeholder.svg"}
                        alt={game.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <span className="font-montserrat font-medium text-sm text-text-primary">{game.title}</span>
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
                <td className="p-3 border-b border-border-color font-roboto text-sm text-text-secondary">
                  {game.price ? `${game.price.toFixed(2)} €` : "-"}
                </td>
                <td className="p-3 border-b border-border-color">
                  <span
                    className="inline-block px-2 py-0.5 rounded-full text-xs font-roboto"
                    style={{ backgroundColor: `${statusColor}20`, color: statusColor }}
                  >
                    {statusName}
                  </span>
                </td>
                <td className="p-3 border-b border-border-color font-roboto text-sm text-text-secondary">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {game.purchaseDate ? formatDate(game.purchaseDate) : "-"}
                  </div>
                </td>
                <td className="p-3 border-b border-border-color font-roboto text-sm text-text-secondary">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {["completed", "platinum"].includes(game.status) && game.completionDate
                      ? formatDate(game.completionDate)
                      : "-"}
                  </div>
                </td>
                <td className="p-3 border-b border-border-color font-roboto text-sm text-text-secondary">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {game.status === "platinum" && game.platinumDate ? formatDate(game.platinumDate) : "-"}
                  </div>
                </td>
                <td className="p-3 border-b border-border-color font-roboto text-sm text-text-secondary">
                  {game.review ? (
                    <RatingStars rating={game.rating} showValue={false} size="sm" />
                  ) : (
                    <span className="text-text-disabled">Non valutata</span>
                  )}
                </td>
                <td className="p-3 border-b border-border-color">
                  <button className="p-1 rounded-full text-text-secondary hover:text-accent-primary transition-colors">
                    <MoreHorizontal className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ListView;