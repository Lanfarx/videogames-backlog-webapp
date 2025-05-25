import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import SectionHeader from '../ui/SectionHeader';
import InProgressGameCard from '../ui/InProgressGameCard';
import { useGamesInProgress } from '../../store/hooks/gamesHooks';

const ContinuePlayingSection: React.FC = () => {
  const inProgressGames = useGamesInProgress();
  
  return (
    <section className="mb-12">
       <div className='container mx-auto px-6 py-8'> 
      <SectionHeader 
        title="Continua a giocare" 
        subtitle="Riprendi da dove avevi lasciato" 
        seeAllLink="/library?filter=in-progress" 
      />
      
      <div className="relative flex items-center py-4">
        {/* Freccia sinistra */}
        <button className="absolute left-0 z-10 -ml-5 h-10 w-10 rounded-full bg-accent-secondary/30 flex items-center justify-center">
          <ChevronLeft className="h-6 w-6 text-text-primary" />
        </button>
        
        {/* Carosello */}
        <div className="flex space-x-6 overflow-x-auto py-4 px-2 w-full scrollbar-hide">
          {inProgressGames.map((game) => {           
            return (
              <InProgressGameCard 
                key={game.id}
                id={game.id.toString()}
                title={game.title}
                coverImage={game.coverImage}
                platform={game.platform}
                hoursPlayed={game.hoursPlayed} 
                rating={game.rating}
                genres={game.genres}
              />
            );
          })}
        </div>
        
        {/* Freccia destra */}
        <button className="absolute right-0 z-10 -mr-5 h-10 w-10 rounded-full bg-accent-secondary/30 flex items-center justify-center">
          <ChevronRight className="h-6 w-6 text-text-primary" />
        </button>
      </div>
      </div>
    </section>
  );
};

export default ContinuePlayingSection;
