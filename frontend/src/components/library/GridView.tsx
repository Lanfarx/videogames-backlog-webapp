import React from 'react';
import GameCard from './GameCard';
import type { Game, GameStatus, GameFilters, SortOption, SortOrder } from '../../types/game';

// Interfaccia per i parametri di navigazione
interface NavigationParams {
  filters: GameFilters;
  sortBy: SortOption;
  sortOrder: SortOrder;
  search: string;
}

interface GridViewProps {
  games: Game[];
  onEdit?: (game: Game) => void;
  onDelete?: (GameId: string) => void;
  onStatusChange?: (GameId: string, Status: GameStatus) => void;
  columns?: number;
  navigationParams?: NavigationParams;
}

const GridView: React.FC<GridViewProps> = ({ games, onEdit, onDelete, onStatusChange, columns = 4, navigationParams }) => {
  return (
    <div className={`grid gap-6 grid-cols-1 ${columns >= 2 ? `sm:grid-cols-2` : ''} ${columns >= 3 ? `lg:grid-cols-3` : ''} ${columns >= 4 ? `xl:grid-cols-4` : ''} ${columns === 5 ? `2xl:grid-cols-5` : ''}`}>
      {games.map((game) => (
        <GameCard 
          key={game.id} 
          game={game} 
          onEdit={onEdit}
          onDelete={onDelete}
          onStatusChange={onStatusChange}
          navigationParams={navigationParams}
        />
      ))}
    </div>
  );
};

export default GridView;