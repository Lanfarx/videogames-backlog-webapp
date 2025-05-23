import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGameById } from '../utils/gamesHooks';
import { useAppDispatch } from '../store/hooks';
import { updateGameStatus, updateGame, deleteGame, updateGamePlaytime } from '../store/slice/gamesSlice';

import { 
  getActivitiesByGameId, 
  recordGameplayHours, 
  recordGameCompletion, 
  recordGamePlatinum, 
  recordGameAbandoned,
  recordStatusChange
} from '../utils/activitiesData';
import { Game, GameComment, GameStatus, GameReview } from '../types/game';
import { Activity, ActivityType } from '../types/activity';
import GamePageLayout from '../components/game/layout/GamePageLayout';
import GameBanner from '../components/game/GameBanner';
import GameCommentsCard from '../components/game/GameCommentsCard';
import GameInfoCard from '../components/game/GameInfoCard';
import NotesReviewCard from '../components/game/NotesReviewCard';
import GameTimelineCard from '../components/game/GameTimelineCard';

// Mappa per convertire gli stati del gioco ai tipi di attività
const gameStatusToActivityType: Record<GameStatus, ActivityType> = {
  'in-progress': 'played',
  'not-started': 'added',
  'completed': 'completed',
  'abandoned': 'abandoned',
  'platinum': 'platinum'
};

export default function GamePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const game = useGameById(id ? parseInt(id) : -1);
  const dispatch = useAppDispatch();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [comments, setComments] = useState<GameComment[]>([]);

  // Carica le attività e i commenti solo quando cambia il gioco
  useEffect(() => {
    if (game) {
      setComments(game.comments || []);
      const gameActivities = getActivitiesByGameId(game.id);
      setActivities(gameActivities);
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
    
    dispatch(updateGameStatus({ gameId: game.id, status: newStatus }));
    
    // Aggiorna la lista delle attività (solo locale)
    let newActivity: Activity | null = null;
    switch (newStatus) {
      case 'completed':
        newActivity = recordGameCompletion(Number(game.id), game.title);
        break;
      case 'platinum':
        newActivity = recordGamePlatinum(Number(game.id), game.title);
        break;
      case 'abandoned':
        newActivity = recordGameAbandoned(Number(game.id), game.title);
        break;
      case 'not-started':
        newActivity = recordStatusChange(Number(game.id), game.title, 'added');
        break;
      default:
        // Per sicurezza, usiamo la mappa per convertire lo stato del gioco al tipo di attività
        const activityType = gameStatusToActivityType[newStatus] || 'added';
        newActivity = recordStatusChange(Number(game.id), game.title, activityType);
        break;
    }
    if (newActivity) setActivities(prev => [newActivity as Activity, ...prev]);
  };

  const handleEditGame = (updatedGameDetails: Partial<Game>) => {
    if (!game) return;
    dispatch(updateGame({ ...game, ...updatedGameDetails }));
  };

  const handleDeleteGame = () => {
    if (!game) return;
    dispatch(deleteGame(game.id));
    navigate('/library');
  };

  const handleUpdatePlaytime = (newHours: number) => {
    if (game) {
      dispatch(updateGamePlaytime({ gameId: game.id, hoursPlayed: newHours }));
      const hoursAdded = newHours - game.hoursPlayed;
      const newActivity = recordGameplayHours(Number(game.id), game.title, hoursAdded);
      setActivities(prev => [newActivity, ...prev]);
    }
  };

  const handleNotesChange = (notes: string) => {
    console.log('Note aggiornate:', notes);
  };

  const handleReviewSave = (review: GameReview) => {
    if (!game) return;
    
    // Aggiorna il gioco con la nuova recensione
    const updatedGame = {
      ...game,
      review: review
      // Non aggiorniamo più il rating qui, viene calcolato automaticamente
    };
    
    // setGame(updatedGame);
    
    console.log('Recensione salvata:', review);
    // In un'app reale, qui ci sarebbe una chiamata API per salvare i dati
    // updateGameAPI(updatedGame).then(response => {...})
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
    setComments(updatedComments);
    
    // Aggiorna anche il gioco locale con i nuovi commenti
    const updatedGame = {
      ...game,
      comments: updatedComments
    };
    // setGame(updatedGame);
    
    console.log('Nuovo commento aggiunto:', newComment);
  };

  const handleEditComment = (id: number, newText: string) => {
    if (!game) return;
    
    const updatedComments = comments.map(comment => 
      comment.id === id 
        ? { ...comment, text: newText } 
        : comment
    );
    
    setComments(updatedComments);
    
    // Aggiorna anche il gioco locale
    const updatedGame = {
      ...game,
      comments: updatedComments
    };
    // setGame(updatedGame);
    
    console.log('Commento modificato:', id, newText);
  };

  const handleDeleteComment = (id: number) => {
    if (!game) return;
    
    const updatedComments = comments.filter(comment => comment.id !== id);
    setComments(updatedComments);
    
    const updatedGame = {
      ...game,
      comments: updatedComments
    };
    // setGame(updatedGame);
    
    console.log('Commento eliminato:', id);
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
