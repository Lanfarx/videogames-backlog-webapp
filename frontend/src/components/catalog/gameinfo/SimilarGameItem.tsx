import React from 'react';
import { Link } from 'react-router-dom';
import { Award } from 'lucide-react';
import type { PublicCatalogGame } from '../../../types/game';
import { CommunityRatingDto } from '../../../types/community';
import { formatMetacriticScore } from '../../../utils/gameDisplayUtils';

interface SimilarGameItemProps {
  game: PublicCatalogGame;
  communityRating?: CommunityRatingDto;
  horizontal?: boolean;
}

// Componente funzione per rappresentare un singolo gioco simile
export function SimilarGameItem({ game, communityRating, horizontal = false }: SimilarGameItemProps) {
  const rating = communityRating?.rating || 0;
  const reviewCount = communityRating?.reviewCount || 0;

  if (horizontal) {
    // Layout orizzontale - Card compatta
    return (
      <Link 
        key={game.title}
        to={`/catalog/${game.id}`}
        className="block group"
      >
        <div className="flex flex-col bg-secondary-bg/50 rounded-xl p-4 hover:bg-secondary-bg hover:shadow-lg transition-all duration-300 h-full">
          <div className="flex-shrink-0 mb-3">
            <img 
              src={game.CoverImage || "/placeholder.svg"} 
              alt={game.title}
              className="w-full h-32 object-cover rounded-lg shadow-sm"
            />
          </div>
          <div className="flex-1 flex flex-col">
            <h4 className="font-medium text-text-primary group-hover:text-accent-primary transition-colors line-clamp-2 leading-tight mb-2 text-sm">
              {game.title}
            </h4>
            <p className="text-xs text-text-secondary mb-2">
              {game.ReleaseYear}
            </p>            <div className="flex items-center justify-between text-xs text-text-secondary mt-auto">
              <span className="flex items-center gap-1">
                <span>★ {rating > 0 ? rating.toFixed(1) : 'N.D.'}</span>
                {reviewCount > 0 && (
                  <span className="text-text-secondary/70">({reviewCount})</span>
                )}
              </span>
              <span className="flex items-center gap-1">
                <Award className="h-3 w-3 text-yellow-400 fill-current" />
                {formatMetacriticScore(game.Metacritic)}
              </span>
            </div>
          </div>
        </div>
      </Link>
    );
  }  
  
  // Layout verticale - Layout semplificato
  return (
    <Link 
      key={game.title}
      to={`/catalog/${game.id}`}
      className="block group"
    >
      <div className="flex gap-3 p-3 rounded-lg hover:bg-secondary-bg transition-colors cursor-pointer">
        <div className="flex-shrink-0">
          <img 
            src={game.CoverImage || "/placeholder.svg"} 
            alt={game.title}
            className="w-16 h-20 object-cover rounded-lg shadow-sm"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-text-primary group-hover:text-accent-primary transition-colors line-clamp-2 leading-tight mb-1">
            {game.title}
          </h4>
          <p className="text-xs text-text-secondary mb-2">
            {game.ReleaseYear}
          </p>            <div className="flex items-center justify-between text-xs text-text-secondary">
            <span className="flex items-center gap-1">
              <span>★ {rating > 0 ? rating.toFixed(1) : 'N.D.'}</span>
              {reviewCount > 0 && (
                <span className="text-text-secondary/70">({reviewCount})</span>
              )}
            </span>
            <span className="flex items-center gap-1">
              <Award className="h-3 w-3 text-yellow-400 fill-current" />
              {formatMetacriticScore(game.Metacritic)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
