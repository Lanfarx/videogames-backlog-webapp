import React from 'react';
import GameCard from './GameCard';
import type { Game } from '../../types/game';

interface GridViewProps {
  games: Game[];
}

const GridView: React.FC<GridViewProps> = ({ games }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {games.map((game) => (
        <GameCard key={game.id} game={game} />
      ))}
    </div>
  );
};

export default GridView;