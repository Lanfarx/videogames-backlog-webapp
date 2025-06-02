import React from 'react';
import GameCard from './GameCard';
import type { Game, GameStatus } from '../../types/game';

interface GridViewProps {
  games: Game[];
  onEdit?: (game: Game) => void;
  onDelete?: (GameId: string) => void;
  onStatusChange?: (GameId: string, Status: GameStatus) => void;
  columns?: number;
}

const GridView: React.FC<GridViewProps> = ({ games, onEdit, onDelete, onStatusChange, columns = 4 }) => {
  return (
    <div className={`grid gap-6 grid-cols-1 ${columns >= 2 ? `sm:grid-cols-2` : ''} ${columns >= 3 ? `lg:grid-cols-3` : ''} ${columns >= 4 ? `xl:grid-cols-4` : ''} ${columns === 5 ? `2xl:grid-cols-5` : ''}`}>
      {games.map((game) => (
        <GameCard 
          key={game.id} 
          game={game} 
          onEdit={onEdit}
          onDelete={onDelete}
          onStatusChange={onStatusChange}
        />
      ))}
    </div>
  );
};

export default GridView;