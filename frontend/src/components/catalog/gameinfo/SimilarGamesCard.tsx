import React from 'react';
import { Star } from 'lucide-react';
import type { PublicCatalogGame } from '../../../types/game';
import { SimilarGameItem } from './SimilarGameItem';
import { useSimilarGames } from '../../../store/hooks/useSimilarGames';

interface SimilarGamesCardProps {
  currentGame: PublicCatalogGame;
}

const SimilarGamesCard: React.FC<SimilarGamesCardProps> = ({ currentGame }) => {
  const recommendedGames = useSimilarGames(currentGame, 4);

  return (
    <div className="bg-primary-bg border border-border-color rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-primary font-semibold text-lg text-text-primary">
          Giochi Simili
        </h3>
      </div>
      <div className="space-y-4">
        {recommendedGames.length > 0 ? (
          recommendedGames.map((game) => (
            <SimilarGameItem key={game.id || game.title} game={game} />
          ))
        ) : (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-secondary-bg rounded-lg flex items-center justify-center mx-auto mb-3">
              <Star className="h-6 w-6 text-text-disabled" />
            </div>
            <p className="text-text-secondary text-sm">
              Nessun gioco simile trovato
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimilarGamesCard;
