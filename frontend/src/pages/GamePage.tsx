import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getGameById, getGameRating } from '../utils/gamesData';
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
  const [game, setGame] = useState<Game | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [comments, setComments] = useState<GameComment[]>([]);

  // Carica i dati del gioco e le attività
  useEffect(() => {
    if (id) {
      const gameData = getGameById(parseInt(id));
      setGame(gameData);
      
      // Inizializza lo stato dei commenti con quelli del gioco
      if (gameData?.comments) {
        setComments(gameData.comments);
      }
      
      // Carica le attività relative al gioco
      const gameActivities = getActivitiesByGameId(parseInt(id));
      setActivities(gameActivities);
    }
  }, [id]);

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
    
    const today = new Date();
    let updatedGame = { ...game, status: newStatus };
    let newActivity: Activity | null = null;
    
    // Aggiorna campi specifici in base allo stato
    switch (newStatus) {
      case 'completed':
        updatedGame.completionDate = today.toISOString().split('T')[0];
        newActivity = recordGameCompletion(game.id, game.title);
        break;
      case 'platinum':
        updatedGame.completionDate = updatedGame.completionDate || today.toISOString().split('T')[0];
        updatedGame.platinumDate = today.toISOString().split('T')[0];
        newActivity = recordGamePlatinum(game.id, game.title);
        break;
      case 'abandoned':
        newActivity = recordGameAbandoned(game.id, game.title);
        break;
      case 'not-started':
        newActivity = recordStatusChange(game.id, game.title, 'added');
        break;
      default:
        // Per sicurezza, usiamo la mappa per convertire lo stato del gioco al tipo di attività
        const activityType = gameStatusToActivityType[newStatus] || 'added';
        newActivity = recordStatusChange(game.id, game.title, activityType);
        break;
    }
    
    // Aggiorna lo stato locale
    setGame(updatedGame);
    
    // Aggiorna la lista delle attività
    if (newActivity) {
      // Corretto per evitare l'errore TypeScript assicurandoci che newActivity non sia null
      setActivities(prev => [newActivity as Activity, ...prev]);
    }
    
    console.log('Stato aggiornato a:', newStatus);
    
    // In un'app reale, qui ci sarebbe una chiamata API per salvare i dati
    // updateGameAPI(updatedGame).then(response => {...})
  };

  const handleEditGame = (updatedGameDetails: Partial<Game>) => {
    if (!game) return;
    
    console.log('Modifica dettagli:', updatedGameDetails);
    
    // Aggiorniamo il gioco con i nuovi dati
    const updatedGame = {
      ...game,
      ...updatedGameDetails
    };
    
    // Aggiorniamo lo stato locale
    setGame(updatedGame);
    
    // In un'app reale, qui ci sarebbe una chiamata API per salvare i dati
    // updateGameAPI(updatedGame).then(response => {...})
  };

  const handleDeleteGame = () => {
    console.log('Elimina gioco:', game?.id);
    
    // In un'app reale, qui ci sarebbe una chiamata API per eliminare il gioco
    // deleteGameAPI(game.id).then(() => {
    //   // Reindirizza l'utente alla pagina della collezione dopo l'eliminazione
    //   navigate('/library');
    // });
    
    // Per ora simuliamo semplicemente il reindirizzamento
    navigate('/library');
  };

  const handleUpdatePlaytime = (newHours: number) => {
    if (game) {
      const hoursAdded = newHours - game.hoursPlayed;
      
      // Aggiorna il gioco
      const updatedGame = { 
        ...game, 
        hoursPlayed: newHours 
      };
      
      // Se il gioco passa da 0 ore a un valore positivo, imposta automaticamente lo stato a "in-progress"
      if (game.hoursPlayed === 0 && newHours > 0 && game.status === 'not-started') {
        updatedGame.status = 'in-progress';
        console.log('Stato automaticamente aggiornato a "In corso" dopo l\'aggiunta di tempo di gioco');
      }
      
      // Aggiorna lo stato locale
      setGame(updatedGame);
      
      // Registra l'attività
      const newActivity = recordGameplayHours(game.id, game.title, hoursAdded);
      
      // Aggiorna la lista delle attività - qui non c'è errore perché newActivity è sempre di tipo Activity
      setActivities(prev => [newActivity, ...prev]);
      
      console.log('Tempo di gioco aggiornato a:', newHours, 'ore');
      
      // In un'app reale, qui ci sarebbe una chiamata API per salvare i dati
      // updateGameAPI(updatedGame).then(response => {...})
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
    
    setGame(updatedGame);
    
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
    setGame(updatedGame);
    
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
    setGame(updatedGame);
    
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
    setGame(updatedGame);
    
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
