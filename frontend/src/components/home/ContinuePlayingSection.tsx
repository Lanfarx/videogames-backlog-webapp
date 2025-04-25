import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import SectionHeader from '../ui/SectionHeader';
import GameCard from '../ui/GameCard';
import { getGamesInProgress } from '../../hooks/gamesData';

const ContinuePlayingSection: React.FC = () => {
  const inProgressGames = getGamesInProgress();
  
  return (
    <section className="mb-12">
      <SectionHeader 
        title="Continua a giocare" 
        subtitle="Riprendi da dove avevi lasciato" 
        seeAllLink="/library?filter=in-progress" 
      />
      
      <div className="relative flex items-center py-4">
        {/* Freccia sinistra */}
        <button className="absolute left-0 z-10 -ml-5 h-10 w-10 rounded-full bg-[#FFCC3F]/30 flex items-center justify-center">
          <ChevronLeft className="h-6 w-6 text-[#222222]" />
        </button>
        
        {/* Carosello */}
        <div className="flex space-x-6 overflow-x-auto py-4 px-2 w-full scrollbar-hide">
          {inProgressGames.map(game => {
            // Calcolo del progresso (esempio: basato su ore giocate, max 100)
            const progress = Math.min(Math.floor((game.hoursPlayed / 50) * 100), 100);
            
            return (
              <GameCard 
                key={game.id}
                title={game.title}
                coverImage={game.coverImage}
                platform={game.platform}
                hoursPlayed={game.hoursPlayed}
                progress={progress}
              />
            );
          })}
        </div>
        
        {/* Freccia destra */}
        <button className="absolute right-0 z-10 -mr-5 h-10 w-10 rounded-full bg-[#FFCC3F]/30 flex items-center justify-center">
          <ChevronRight className="h-6 w-6 text-[#222222]" />
        </button>
      </div>
    </section>
  );
};

export default ContinuePlayingSection;
