import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getGameById } from '../utils/gamesData';
import { getActivitiesByGameId } from '../utils/activitiesData';
import { Game } from '../types/game';
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

  // Carica i dati del gioco e le attività
  useEffect(() => {
    if (id) {
      const gameData = getGameById(parseInt(id));
      setGame(gameData);
      
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

  // I commenti sarebbero normalmente caricati da un API, qui li creiamo staticamente
  const dummyComments = [
    { id: 1, date: '15 Gen 2023', text: 'Ho trovato un easter egg interessante nel Castello di Hyrule!' },
    { id: 2, date: '20 Gen 2023', text: 'La missione secondaria di Tarrey Town è molto coinvolgente.' },
  ];

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

  const handleUpdatePlaytime = () => {
    console.log('Aggiorna tempo di gioco');
  };

  const handleNotesChange = (notes: string) => {
    console.log('Note aggiornate:', notes);
  };

  const handleReviewSave = () => {
    console.log('Recensione salvata');
  };

  const handleAddComment = (text: string) => {
    console.log('Nuovo commento:', text);
  };

  const handleEditComment = (id: number) => {
    console.log('Modifica commento:', id);
  };

  const handleDeleteComment = (id: number) => {
    console.log('Elimina commento:', id);
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
              notes={game.notes}
              onNotesChange={handleNotesChange}
              onReviewSave={handleReviewSave}
            />

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
              comments={dummyComments}
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
