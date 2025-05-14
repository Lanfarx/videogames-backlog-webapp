import React from 'react';
import GameCard from './GameCard';
import type { Game, GameStatus } from '../../types/game';

interface GridViewProps {
  games: Game[];
  onEdit?: (game: Game) => void;
  onDelete?: (gameId: string) => void;
  onStatusChange?: (gameId: string, status: GameStatus) => void;
}

const GridView: React.FC<GridViewProps> = ({ games, onEdit, onDelete, onStatusChange }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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