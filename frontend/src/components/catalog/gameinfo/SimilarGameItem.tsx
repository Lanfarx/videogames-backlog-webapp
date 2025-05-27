import React from 'react';
import { Link } from 'react-router-dom';
import { Award } from 'lucide-react';
import RatingStars from '../../ui/atoms/RatingStars';
import GenreTagList from '../../ui/GenreTagList';
import type { PublicCatalogGame } from '../../../types/game';
import { useCommunityCommunityRating } from '../../../store/hooks/communityHooks';

interface SimilarGameItemProps {
  game: PublicCatalogGame;
}

// Componente funzione per rappresentare un singolo gioco simile
export function SimilarGameItem({ game }: SimilarGameItemProps) {
  const communityRating = useCommunityCommunityRating(game.title);
  const formatGameTitle = (title: string) => title.replace(/ /g, '_');
  return (
    <Link 
      key={game.title}
      to={`/catalog/${game.id}`}
      className="block group"
    >
      <div className="flex gap-3 p-3 rounded-lg hover:bg-secondary-bg transition-colors cursor-pointer">
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
            {game.releaseYear}
          </p>
          <div className="flex items-center gap-2 mb-2">
            <RatingStars rating={communityRating} showValue={false} size="sm" readOnly />
            <span className="text-xs text-text-secondary">
              {communityRating > 0 ? communityRating.toFixed(1) : 'N.D.'}
            </span>
            <div className="flex items-center gap-1 ml-auto">
              <Award className="h-3 w-3 text-yellow-400 fill-current" />
              <span className="text-xs text-text-secondary">{game.metacritic}</span>
            </div>
          </div>
          <GenreTagList 
            genres={game.genres.slice(0, 3).map(g => typeof g === 'string' ? g : g.name)} 
            maxDisplay={3} 
            small={true} 
          />
        </div>
      </div>
    </Link>
  );
}
