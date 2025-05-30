import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGameByTitle, useGameComments, useGameActions } from '../../store/hooks/gamesHooks';
import { useAllActivitiesByGameId, useAllActivitiesActions } from '../../store/hooks/activitiesHooks';
import { createStatusChangeActivity, handlePlaytimeUpdate } from '../../utils/activityUtils';

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
  const decodedTitle = title ? decodeURIComponent(title.replace(/_/g, ' ')) : '';
  const game = useGameByTitle(decodedTitle);
  const { addActivity } = useAllActivitiesActions();
  const activities = useAllActivitiesByGameId(game?.id ?? -1);

  // Nuova logica commenti asincrona
  const { Comments, loadComments, addComment, deleteComment } = useGameComments(game?.id ?? -1);
  // Nuova logica CRUD giochi
  const { update, remove } = useGameActions();

  useEffect(() => {
    if (game && game.id) {
      loadComments();
    }
  }, [game, loadComments]);

  if (!game) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-text-primary font-primary text-xl">Caricamento...</p>
      </div>
    );
  }

  // Gestione delle azioni
  const handleChangeStatus = (newStatus: GameStatus) => {
    if (!game || game.Status === newStatus) return;
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

    // Stato precedente per la funzione di creazione attività
    const prevStatus = game.Status;
    
    // Aggiorna lo stato nel Redux store
    update(game.id, { Status: newStatus });
    
    // Crea e aggiungi l'attività utilizzando la funzione di utilità
    const activity = createStatusChangeActivity(game, newStatus, prevStatus);
    addActivity(activity);
  };

  const handleEditGame = (updatedGameDetails: Partial<Game>) => {
    if (!game) return;
    update(game.id, updatedGameDetails);
  };

  const handleDeleteGame = () => {
    if (!game) return;
    remove(game.id);
    navigate('/library');
  };

  const handleUpdatePlaytime = (newHours: number) => {
    if (game) {
      update(game.id, { HoursPlayed: newHours });
      
      // Usa la funzione di utilità per gestire la creazione di attività
      const result = handlePlaytimeUpdate(game, newHours);
      addActivity(result.activity);
    }
  };

  const handleNotesChange = (Notes: string) => {
    if (!game) return;
    
    // Aggiorna le note nel Redux store
    update(game.id, { Notes });
    
    console.log('Note aggiornate:', Notes);
  };

  const handleReviewSave = (Review: GameReview) => {
    if (!game) return;
    update(game.id, { Review });
  };

  // Commenti asincroni
  const handleAddComment = (text: string) => {
    if (!game) return;
    const today = new Date();
    const newComment: GameComment = {
      Id: 0, // sarà gestito dal backend
      Date: today.toISOString().split('T')[0],
      Text: text
    };
    addComment(newComment);
  };

  const handleEditComment = (id: number, newtext: string) => {
    if (!game) return;
    const comment = Comments.find((c: GameComment) => c.Id === id);
    if (comment) {
      deleteComment(id);
      addComment({ ...comment, Text: newtext });
    }
  };

  const handleDeleteComment = (id: number) => {
    if (!game) return;
    deleteComment(id);
  };

  return (
    <GamePageLayout 
      title={game.Title} 
      parentPath="/library"
      parentLabel="Libreria"
    >
      {/* Banner section con sfondo secondario - larghezza piena */}
      <div className="bg-secondary-bg">
        <GameBanner 
          game={game}
          onChangeStatus={handleChangeStatus}
          onEdit={handleEditGame}
          onDelete={handleDeleteGame}
          onBack={() => navigate('/library')}
          showBackButton={true}
        />
      </div>

      {/* Layout contenuto (2 colonne) - contenitore limitato */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-wrap -mx-4">
            {/* Colonna sinistra (60%) */}
            <div className="w-full lg:w-[60%] px-4 mb-8">
              {/* Note e Recensione */}
              <NotesReviewCard 
                onNotesChange={handleNotesChange}
                onReviewSave={handleReviewSave} 
                game={game}            
              />

              {/* Timeline di Gioco */}
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
