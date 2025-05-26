import React from 'react';
import { Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import RatingStars from '../../ui/atoms/RatingStars';
import GenreTagList from '../../ui/GenreTagList';
import type { PublicCatalogGame } from '../../../data/gamesData';

interface SimilarGamesCardProps {
  currentGame: PublicCatalogGame;
  similarGames: PublicCatalogGame[];
}

const SimilarGamesCard: React.FC<SimilarGamesCardProps> = ({ currentGame, similarGames }) => {
  // Calcola i giochi simili basandosi sui generi
  const calculateSimilarGames = () => {
    const currentGenres = currentGame.genres;
    
    return similarGames
      .filter(game => game.title !== currentGame.title)
      .map(game => {
        const commonGenres = game.genres.filter(genre => currentGenres.includes(genre));
        const similarity = commonGenres.length / Math.max(currentGenres.length, game.genres.length);
        return { ...game, similarity };
      })
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 4);
  };

  const recommendedGames = calculateSimilarGames();

  const getAverageRating = (game: PublicCatalogGame) => {
    // Simula una valutazione media basata sul metacritic
    return Math.min(5, Math.max(1, (game.metacritic / 100) * 5));
  };

  const formatGameTitle = (title: string) => {
    return title.replace(/ /g, '_');
  };

  return (    <div className="bg-primary-bg border border-border-color rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-primary font-semibold text-lg text-text-primary">
          Giochi Simili
        </h3>
      </div>

      <div className="space-y-4">
        {recommendedGames.length > 0 ? (
          recommendedGames.map(game => {
            const avgRating = getAverageRating(game);
            
            return (
              <Link 
                key={game.title}
                to={`/game-info/${formatGameTitle(game.title)}`}
                className="block group"
              >
                <div className="flex gap-3 p-3 rounded-lg hover:bg-secondary-bg transition-colors">
                  <div className="flex-shrink-0">
                    <img 
                      src={game.coverImage || "/placeholder.svg"} 
                      alt={game.title}
                      className="w-16 h-20 object-cover rounded-lg shadow-sm"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-text-primary group-hover:text-accent-primary transition-colors line-clamp-2 leading-tight mb-1">
                      {game.title}
                    </h4>
                    
                    <p className="text-xs text-text-secondary mb-2">
                      {game.developer} • {game.releaseYear}
                    </p>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <RatingStars rating={avgRating} showValue={false} size="sm" readOnly />
                      <span className="text-xs text-text-secondary">
                        {avgRating.toFixed(1)}
                      </span>
                      <div className="flex items-center gap-1 ml-auto">
                        <Star className="h-3 w-3 text-yellow-400 fill-current" />
                        <span className="text-xs text-text-secondary">{game.metacritic}</span>
                      </div>
                    </div>
                    
                    <GenreTagList 
                      genres={game.genres.slice(0, 2)} 
                      maxDisplay={2} 
                      small={true} 
                    />
                  </div>
                </div>
              </Link>
            );
          })
        ) : (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-secondary-bg rounded-lg flex items-center justify-center mx-auto mb-3">
              <Star className="h-6 w-6 text-text-disabled" />
            </div>
            <p className="text-text-secondary text-sm">
              Nessun gioco simile trovato
            </p>          </div>
        )}
      </div>
    </div>
  );
};

export default SimilarGamesCard;
