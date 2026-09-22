import React from 'react';
import { Award } from 'lucide-react';
import StatusIndicator from '../ui/atoms/StatusIndicator';
import StatusBadge from '../ui/atoms/StatusBadge';
import { formatPrice, formatMetacriticScore } from '../../utils/gameDisplayUtils';

interface GamePreviewCardProps {
  gameData: any;
}

export default function GamePreviewCard({ gameData }: GamePreviewCardProps) {
  return (
    <div className="bg-secondary-bg rounded-xl p-6 sticky top-8">
      <h3 className="font-montserrat font-semibold text-xl text-text-primary mb-4">Anteprima scheda</h3>

      <div className="bg-primary-bg border border-border-color rounded-xl shadow-sm relative overflow-hidden flex flex-col">
        {/* Indicatore di stato */}
        <StatusIndicator Status={gameData.Status} />

        {/* Copertina */}
        <div className="relative h-[180px] overflow-hidden">
          <div className="absolute inset-0 bg-accent-secondary/20 z-10"></div>
          {gameData.CoverImage ? (
            <img
              src={gameData.CoverImage || "/placeholder.svg"}
              alt={gameData.Title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-tertiary-bg flex items-center justify-center text-text-secondary">
              Nessuna copertina
            </div>
          )}
        </div>

        {/* Contenuto */}
        <div className="p-4 flex-grow">
          <h3 className="font-montserrat font-semibold text-base text-text-primary line-clamp-2 min-h-[3rem]">
            {gameData.Title || "Titolo del gioco"}
          </h3>

          <div className="flex items-center mt-2 text-text-secondary flex-wrap">
            <span className="font-roboto text-xs">{gameData.Platform || "Piattaforma"}</span>
            <span className="mx-2">|</span>
            <span className="font-roboto text-xs">{gameData.HoursPlayed || 0} ore</span>
            <>
              <span className="mx-2">|</span>
              <Award className="h-4 w-4 mr-1 text-yellow-500" />
              <span className="font-roboto text-xs">{formatMetacriticScore(gameData.Metacritic)}</span>
            </>
          </div>
          {/* Prezzo */}
          <div className="mt-2 text-text-secondary">
            <span className="font-roboto text-xs">{formatPrice(gameData.Price, gameData.Platform)}</span>
          </div>

          {/* Stato */}
          <div className="mt-2">
            <StatusBadge Status={gameData.Status} />
          </div>
        </div>
      </div>
    </div>
  );
}
