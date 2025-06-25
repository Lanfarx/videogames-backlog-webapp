import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SectionHeader from '../ui/SectionHeader';
import InProgressGameCard from '../ui/InProgressGameCard';
import { getInProgressGamesPaginated } from '../../store/services/gamesService';

const ContinuePlayingSection: React.FC = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationData, setPaginationData] = useState<{
    games: any[];
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  }>({
    games: [],
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false
  });
  const [loading, setLoading] = useState(true);

  // Funzione per caricare i giochi
  const loadGames = async (page: number) => {
    try {
      setLoading(true);
      const data = await getInProgressGamesPaginated(page, 6);
      setPaginationData({
        games: data.games,
        totalPages: data.totalPages,
        hasNextPage: data.hasNextPage,
        hasPreviousPage: data.hasPreviousPage
      });
      setCurrentPage(page);
    } catch (error) {
      console.error('Errore nel caricamento dei giochi:', error);
    } finally {
      setLoading(false);
    }
  };

  // Carica i giochi al mount
  useEffect(() => {
    loadGames(1);
  }, []);

  // Funzioni per navigare tra le pagine
  const goToPreviousPage = () => {
    if (paginationData.hasPreviousPage) {
      loadGames(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (paginationData.hasNextPage) {
      loadGames(currentPage + 1);
    }
  };

  if (loading) {
    return (
      <section className="mb-12">
        <div className='container mx-auto px-6 py-8'>
          <SectionHeader 
            title="Continua a giocare" 
            subtitle="Riprendi da dove avevi lasciato" 
            seeAllLink="/library?filter=InProgress" 
          />
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary"></div>
          </div>
        </div>
      </section>
    );
  }

  // Controlla se non ci sono giochi
  if (!paginationData.games || paginationData.games.length === 0) {
    return (
      <section className="mb-12">
        <div className='container mx-auto px-6 py-8'>
          <div className="animate-fade-in-up">
            <SectionHeader 
              title="Continua a giocare" 
              subtitle="Riprendi da dove avevi lasciato" 
              seeAllLink="/library?filter=InProgress" 
            />
          </div>
          <div className="animate-fade-in-up delay-200">
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center bg-surface-secondary rounded-xl border border-accent-secondary/20">
              <div className="text-7xl mb-6 opacity-50">🎮</div>
              <h3 className="text-2xl font-semibold text-text-primary mb-3 font-primary">Nessun gioco in corso</h3>
              <p className="text-text-secondary mb-8 max-w-md leading-relaxed font-secondary">
                Non hai ancora iniziato nessun gioco. Aggiungi un gioco al tuo backlog e inizia a giocare per vederlo apparire qui!
              </p>
              <button 
                onClick={() => navigate('/library')}
                className="bg-accent-primary hover:bg-accent-primary/90 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:scale-105"
              >
                Esplora la libreria
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-12">
      <div className='container mx-auto px-6 py-8'> 
        {/* Header con animazione fadeInUp */}
        <div className="animate-fade-in-up">
          <SectionHeader 
            title="Continua a giocare" 
            subtitle="Riprendi da dove avevi lasciato" 
            seeAllLink="/library?filter=InProgress" 
          />
        </div>
        
        {/* Container giochi con animazione e delay */}
        <div className="relative flex items-center py-4 animate-fade-in-up delay-200">
          {/* Freccia sinistra */}
          <button 
            onClick={goToPreviousPage}
            disabled={!paginationData.hasPreviousPage}
            className={`absolute left-0 z-10 -ml-5 h-10 w-10 rounded-full flex items-center justify-center transition-all duration-200 ${
              paginationData.hasPreviousPage 
                ? 'bg-accent-primary hover:bg-accent-primary/90 cursor-pointer' 
                : 'bg-accent-secondary/30 cursor-not-allowed opacity-50'
            }`}
          >
            <ChevronLeft className="h-6 w-6 text-white" />
          </button>
          
          {/* Griglia giochi con animazioni scaglionate */}
          <div className="flex space-x-6 overflow-hidden py-4 px-2 w-full">
            {(Array.isArray(paginationData.games) ? paginationData.games : []).map((game: any, index: number) => (
              <div key={game.id} className={`animate-fade-in-up delay-${300 + index * 100}`}>
                <InProgressGameCard 
                  id={game.id.toString()}
                  title={game.title}
                  CoverImage={game.coverImage}
                  Platform={game.platform}
                  HoursPlayed={game.hoursPlayed} 
                  Rating={game.rating}
                  Genres={game.genres}
                />
              </div>
            ))}
          </div>
          
          {/* Freccia destra */}
          <button 
            onClick={goToNextPage}
            disabled={!paginationData.hasNextPage}
            className={`absolute right-0 z-10 -mr-5 h-10 w-10 rounded-full flex items-center justify-center transition-all duration-200 ${
              paginationData.hasNextPage 
                ? 'bg-accent-primary hover:bg-accent-primary/90 cursor-pointer' 
                : 'bg-accent-secondary/30 cursor-not-allowed opacity-50'
            }`}
          >
            <ChevronRight className="h-6 w-6 text-white" />
          </button>
        </div>

        {/* Indicatore pagina con animazione */}
        {paginationData.totalPages > 1 && (
          <div className="flex justify-center mt-4 animate-fade-in-up delay-900">
            <span className="text-sm text-text-secondary">
              Pagina {currentPage} di {paginationData.totalPages}
            </span>
          </div>
        )}
      </div>
    </section>
  );
};

export default ContinuePlayingSection;
