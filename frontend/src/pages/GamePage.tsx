import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGameById } from '../store/hooks/index';
import { useAllActivitiesByGameId, useAllActivitiesActions } from '../store/hooks/activitiesHooks';
import { useAppDispatch } from '../store/hooks';
import { updateGameStatus, updateGame, deleteGame, updateGamePlaytime, updateGameNotes, updateGameReview, updateGameRating } from '../store/slice/gamesSlice';
import { createStatusChangeActivity, handlePlaytimeUpdate, createRatingActivity } from '../utils/activityUtils';
import { calculateRatingFromReview } from '../utils/gamesUtils';

import { Game, GameComment, GameStatus, GameReview } from '../types/game';
import GamePageLayout from '../components/game/layout/GamePageLayout';
import GameBanner from '../components/game/GameBanner';
import GameCommentsCard from '../components/game/GameCommentsCard';
import GameInfoCard from '../components/game/GameInfoCard';
import NotesReviewCard from '../components/game/NotesReviewCard';
import GameTimelineCard from '../components/game/GameTimelineCard';

export default function GamePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const game = useGameById(id ? parseInt(id) : -1);
  const dispatch = useAppDispatch();
  const { addActivity } = useAllActivitiesActions();
  const [comments, setComments] = useState<GameComment[]>([]);
  const activities = useAllActivitiesByGameId(game?.id ?? -1);
  
  // Carica i commenti solo quando cambia il gioco
  useEffect(() => {
    if (game) {
      setComments(game.comments || []);
    }
  }, [game]);

  if (!game) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-text-primary font-primary text-xl">Caricamento...</p>
      </div>
    );
  }
  // Gestione delle azioni
  const handleChangeStatus = (newStatus: GameStatus) => {
    if (!game || game.status === newStatus) return;
    // Controlli di business:
    // 1. Non permettere il cambio a "in-progress" se non ci sono ore giocate
    if (newStatus === 'in-progress' && game.hoursPlayed === 0) {
      console.warn('Non è possibile impostare lo stato "In corso" per un gioco senza tempo di gioco registrato.');
      return;
    }
    
    // 2. Non permettere di impostare "not-started" se il gioco ha già tempo di gioco registrato
    if (newStatus === 'not-started' && game.hoursPlayed > 0) {
      console.warn('Non è possibile impostare lo stato "Da iniziare" per un gioco con tempo di gioco registrato.');
      return;
    }

    // Stato precedente per la funzione di creazione attività
    const prevStatus = game.status;
    
    // Aggiorna lo stato nel Redux store
    dispatch(updateGameStatus({ gameId: game.id, status: newStatus }));
    
    // Crea e aggiungi l'attività utilizzando la funzione di utilità
    const activity = createStatusChangeActivity(game, newStatus, prevStatus);
    addActivity(activity);
  };

  const handleEditGame = (updatedGameDetails: Partial<Game>) => {
    if (!game) return;
    dispatch(updateGame({ ...game, ...updatedGameDetails }));
  };

  const handleDeleteGame = () => {
    if (!game) return;
    dispatch(deleteGame(game.id));
    navigate('/library');
  };  const handleUpdatePlaytime = (newHours: number) => {
    if (game) {
      // Aggiorna le ore nel Redux store
      dispatch(updateGamePlaytime({ gameId: game.id, hoursPlayed: newHours }));
      
      // Usa la funzione di utilità per gestire la creazione di attività
      const result = handlePlaytimeUpdate(game, newHours);
      addActivity(result.activity);
    }
  };
  const handleNotesChange = (notes: string) => {
    if (!game) return;
    
    // Aggiorna le note nel Redux store
    dispatch(updateGameNotes({ gameId: game.id, notes }));
    
    console.log('Note aggiornate:', notes);
  };

  const handleReviewSave = (review: GameReview) => {
    if (!game) return;
    
    // Aggiorna il gioco con la nuova recensione
    dispatch(updateGameReview({ gameId: game.id, review }));
    
    // Calcola e aggiorna il rating
    const averageRating = calculateRatingFromReview(review);
    dispatch(updateGameRating({ gameId: game.id, rating: averageRating }));
    
    // Crea un'attività per la valutazione
    const ratingActivity = createRatingActivity(game, averageRating);
    addActivity(ratingActivity);
    
    console.log('Recensione salvata:', review);
  };  // Funzione generica per aggiornare i commenti e il gioco
  const updateGameComments = (updatedComments: GameComment[]) => {
    if (!game) return;
    
    const updatedGame = {
      ...game,
      comments: updatedComments
    };
    
    dispatch(updateGame(updatedGame));
  };

  const handleAddComment = (text: string) => {
    if (!game) return;
    
    const today = new Date();
    const newComment: GameComment = {
      id: comments.length > 0 ? Math.max(...comments.map(c => c.id)) + 1 : 1,
      date: today.toISOString().split('T')[0],
      text
    };
    
    const updatedComments = [...comments, newComment];
    updateGameComments(updatedComments);
  };

  const handleEditComment = (id: number, newText: string) => {
    if (!game) return;
    
    const updatedComments = comments.map(comment => 
      comment.id === id ? { ...comment, text: newText } : comment
    );
    
    updateGameComments(updatedComments);
  };

  const handleDeleteComment = (id: number) => {
    if (!game) return;
    
    const updatedComments = comments.filter(comment => comment.id !== id);
    updateGameComments(updatedComments);
  };

  return (
    <GamePageLayout title={game.title} onBackClick={() => navigate(-1)}>
      {/* Banner section con sfondo secondario */}
      <div className="bg-secondary-bg">
        <GameBanner 
          game={game}
          onChangeStatus={handleChangeStatus}
          onEdit={handleEditGame}
          onDelete={handleDeleteGame}
        />
      </div>

      {/* Layout contenuto (2 colonne) */}
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
              onEditInfo={handleEditGame} // Aggiungiamo questa prop per abilitare la modifica delle informazioni
            />
            {/* Sezione Commenti/Appunti */}
            <GameCommentsCard 
              comments={comments}
              onAddComment={handleAddComment}
              onEditComment={handleEditComment}
              onDeleteComment={handleDeleteComment}
            />
          </div>
        </div>
      </div>
    </GamePageLayout>
  );
}
