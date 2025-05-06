import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getGameById } from '../utils/gamesData';
import { getActivitiesByGameId } from '../utils/activitiesData';
import { Game, GameComment } from '../types/game';
import { Activity } from '../types/activity';
import GamePageLayout from '../components/game/layout/GamePageLayout';
import GameBanner from '../components/game/GameBanner';
import GameCommentsCard from '../components/game/GameCommentsCard';
import GameInfoCard from '../components/game/GameInfoCard';
import GameTimelineCard from '../components/game/GameTimelineCard';
import NotesReviewCard from '../components/game/NotesReviewCard';

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
  const handleChangeStatus = () => {
    console.log('Modifica stato');
  };

  const handleEditGame = () => {
    console.log('Modifica dettagli');
  };

  const handleDeleteGame = () => {
    console.log('Elimina gioco');
  };

  const handleUpdatePlaytime = (newHours: number) => {
    if (game) {
      // Crea una copia aggiornata del gioco
      const updatedGame = { 
        ...game, 
        hoursPlayed: newHours 
      };
      
      // Aggiorna lo stato locale
      setGame(updatedGame);
      
      console.log('Tempo di gioco aggiornato a:', newHours, 'ore');
      
      // In un'app reale, qui ci sarebbe una chiamata API per salvare i dati
      // updateGameAPI(updatedGame).then(response => {...})
    }
  };

  const handleNotesChange = (notes: string) => {
    console.log('Note aggiornate:', notes);
  };

  const handleReviewSave = () => {
    console.log('Recensione salvata');
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
    
    // Aggiorna anche il gioco locale
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
      <div className="bg-secondaryBg">
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
              game={game}            />

            {/* Timeline di Gioco */}
            <GameTimelineCard activities={activities} />
          </div>

          {/* Colonna destra (40%) */}
          <div className="w-full lg:w-[40%] px-4">
            {/* Card Informazioni */}
            <GameInfoCard 
              game={game}
              onEdit={handleEditGame}
              onUpdatePlaytime={handleUpdatePlaytime}
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
