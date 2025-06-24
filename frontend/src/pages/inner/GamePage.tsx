import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {useGameComments, useGameActions, useGameByTitle, useLoadSingleGameByTitle } from '../../store/hooks/gamesHooks';
import { useAllActivitiesByGameId } from '../../store/hooks/activitiesHooks';
import { useGameNavigation } from '../../store/hooks/useGameNavigation';

import { Game, GameComment, GameStatus, GameReview } from '../../types/game';
import GameBanner from '../../components/game/GameBanner';
import GameCommentsCard from '../../components/game/GameCommentsCard';
import GameInfoCard from '../../components/game/GameInfoCard';
import NotesReviewCard from '../../components/game/NotesReviewCard';
import GameTimelineCard from '../../components/game/GameTimelineCard';
import GamePageLayout from '../../components/game/layout/GamePageLayout';


export default function GamePage() {  
  const { title } = useParams<{ title: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const decodedTitle = title ? decodeURIComponent(title.replace(/_/g, ' ')) : '';
  
  // Aggiungiamo l'hook per caricare il gioco
  const { game, loading: gameLoading } = useLoadSingleGameByTitle(decodedTitle);
  
  // Estraiamo i parametri di navigazione dallo state della location (se disponibili)
  // Questi verranno passati dalla LibraryPage quando si naviga verso la GamePage
  const navigationParams = location.state?.navigationParams || {
    filters: {},
    sortBy: 'title',
    sortOrder: 'asc',
    search: ''
  };
  
  // Hook per la navigazione tra giochi
  const gameNavigation = useGameNavigation({
    currentGame: game!,
    filters: navigationParams.filters,
    sortBy: navigationParams.sortBy,
    sortOrder: navigationParams.sortOrder,
    search: navigationParams.search
  });
    // Riattivo le attività per il componente GameTimelineCard
  const { activities, loading: activitiesLoading } = useAllActivitiesByGameId(game?.id ?? -1);
  // Nuova logica commenti asincrona con prevenzione flooding
  const { Comments, addComment, deleteComment, updateComment } = useGameComments(game?.id ?? -1);
  // Nuova logica CRUD giochi
  const { update, remove } = useGameActions();
  
  // Gestione stati di loading ed errore
  // Mostra spinner durante il caricamento
  if (gameLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-text-primary font-primary text-xl mb-4">Caricamento gioco...</p>
        </div>
      </div>
    );
  }
  // Funzione per tornare alla libreria preservando lo stato
  const handleBackToLibrary = () => {
    navigate('/library');
  };

  // Mostra il messaggio "gioco non trovato" solo se il caricamento è completato
  if (!game) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-text-primary font-primary text-xl mb-4">Gioco non trovato</p>
          <p className="text-text-secondary mb-4">Il gioco "{decodedTitle}" non è presente nella tua libreria.</p>          <button 
            onClick={handleBackToLibrary} 
            className="px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90"
          >
            Torna alla Libreria
          </button>
        </div>
      </div>
    );  
  }  // Gestione delle azioni
  const handleChangeStatus = async (newStatus: GameStatus) => {
    if (game.Status === newStatus) return;    
    
    // Controlli di business:
    // 1. Non permettere il cambio a "InProgress" se non ci sono ore giocate
    if (newStatus === 'InProgress' && game.HoursPlayed === 0) {
      console.warn('Non è possibile impostare lo stato "In corso" per un gioco senza tempo di gioco registrato.');
      return;
    }
    // 2. Non permettere di impostare "NotStarted" se il gioco ha già tempo di gioco registrato
    if (newStatus === 'NotStarted' && game.HoursPlayed > 0) {
      console.warn('Non è possibile impostare lo stato "Da iniziare" per un gioco con tempo di gioco registrato.');
      return;
    }    
    
    // Aggiorna lo stato nel Redux store - il backend creerà automaticamente l'attività
    update(game.id, { Status: newStatus });
  };  const handleEditGame = (updatedGameDetails: Partial<Game>) => {
    update(game.id, updatedGameDetails);
  };  const handleDeleteGame = () => {
    remove(game.id);
    handleBackToLibrary();
  };const handleUpdatePlaytime = async (newHours: number) => {
    // Aggiorna il playtime nel Redux store - il backend creerà automaticamente l'attività
    update(game.id, { HoursPlayed: newHours });
  };// Commenti asincroni
  const handleAddComment = (text: string) => {
    const today = new Date();
    const newComment: GameComment = {
      Id: 0, // sarà gestito dal backend
      Date: today.toISOString().split('T')[0],
      Text: text
    };
    addComment(newComment);
  };
  
  const handleEditComment = (id: number, newtext: string) => {
    const comment = Comments.find((c: GameComment) => c.Id === id);
    if (comment) {
      updateComment(id, { ...comment, Text: newtext });
    }
  };
  const handleDeleteComment = (id: number) => {
    deleteComment(id);
  };
  return (
    <GamePageLayout 
      title={game.Title} 
      parentPath="/library"
      parentLabel="Libreria"
    >      {/* Banner section con sfondo secondario - larghezza piena */}
      <div className="bg-secondary-bg">
        <GameBanner 
          game={game}
          onChangeStatus={handleChangeStatus}
          onEdit={handleEditGame}
          onDelete={handleDeleteGame}
          onBack={handleBackToLibrary}
          showBackButton={true}
          // Props per la navigazione
          canGoToPrevious={gameNavigation.canGoToPrevious}
          canGoToNext={gameNavigation.canGoToNext}
          onGoToPrevious={gameNavigation.goToPrevious}
          onGoToNext={gameNavigation.goToNext}
          currentIndex={gameNavigation.currentIndex}
          totalGames={gameNavigation.totalGames}
        />
      </div>

      {/* Layout contenuto (2 colonne) - contenitore limitato */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-wrap -mx-4">
            {/* Colonna sinistra (60%) */}
            <div className="w-full lg:w-[60%] px-4 mb-8">              {/* Note e Recensione */}
              <NotesReviewCard 
                game={game}            
              />              {/* Timeline di Gioco */}
              <GameTimelineCard 
                activities={activities} 
                game={game} 
              />
            </div>

            {/* Colonna destra (40%) */}
            <div className="w-full lg:w-[40%] px-4">
              {/* Card Informazioni */}
              <GameInfoCard 
                game={game}
                onUpdatePlaytime={handleUpdatePlaytime}
                onEditInfo={handleEditGame}
              />
              {/* Sezione Commenti/Appunti */}
              <GameCommentsCard 
                Comments={Comments}
                onAddComment={handleAddComment}
                onEditComment={handleEditComment}
                onDeleteComment={handleDeleteComment}
              />
            </div>
          </div>
        </div>
      </div>
    </GamePageLayout>
  );
}


