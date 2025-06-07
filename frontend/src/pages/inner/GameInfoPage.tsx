import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGameById, useGameByTitle } from '../../store/hooks/gamesHooks';
import { useCommunityReviewsByGame, useCommunityCommunityRating } from '../../store/hooks/communityHooks';
import { Award, Plus, Users, Star, Clock, Trophy, Gamepad2, ArrowLeft } from "lucide-react";
import CommunityReviewsSection from "../../components/catalog/gameinfo/CommunityReviewsSection";
import SimilarGamesCard from "../../components/catalog/gameinfo/SimilarGamesCard";
import PersonalReviewCard from "../../components/catalog/gameinfo/PersonalReviewCard";
import GamePageLayout from "../../components/game/layout/GamePageLayout";
import GenreTagList from "../../components/ui/GenreTagList";
import { BookOpen } from "lucide-react";
import { getGameDetails } from '../../store/services/rawgService';
import type { PublicCatalogGame } from '../../types/game';
import CommunityStats from "../../components/catalog/gameinfo/CommunityStats";
import { formatMetacriticScore } from '../../utils/gameDisplayUtils';

const GameInfoPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [rawgGame, setRawgGame] = React.useState<PublicCatalogGame | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);  React.useEffect(() => {
    if (!id) return;
    setLoading(true);
    getGameDetails(id)
      .then((data: any) => {
        // I dati sono già mappati da getGameDetails, quindi usiamo direttamente
        const adapted: PublicCatalogGame = {
          id: data.id,
          title: data.Title, // Usa Title mappato
          description: data.Description, // Usa Description mappato
          CoverImage: data.CoverImage,
          Developer: data.Developer,
          Publisher: data.Publisher,
          ReleaseYear: data.ReleaseYear,
          Genres: data.Genres || [],
          Metacritic: data.Metacritic,
          Platforms: data.Platforms || [],
        };
        setRawgGame(adapted);
      })
      .catch(() => setError('Errore nel caricamento dei dettagli dal catalogo RAWG.'))
      .finally(() => setLoading(false));  }, [id]);
  // Per la libreria utente, cerca tramite titolo semplice
  // Hook sempre in cima, non condizionale
  const userGameByTitle = useGameByTitle(rawgGame?.title || "");

  const isInLibrary = !!userGameByTitle;
  const personalReview = userGameByTitle && userGameByTitle.Review
    ? { ...userGameByTitle.Review, title: userGameByTitle.Title }
    : undefined;

  // Usa rawgGame come game solo se presente
  const game = rawgGame;

  // Stato per mostra altro descrizione
  const [showFullDescription, setShowFullDescription] = React.useState(false);
  const DESCRIPTION_LIMIT = 400;
  const isDescriptionLong = !!game && game.description.length > DESCRIPTION_LIMIT;
  const descriptionToShow = showFullDescription || !isDescriptionLong
    ? game?.description || ''
    : (game?.description?.slice(0, DESCRIPTION_LIMIT) || '') + '...';

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!game) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-lg text-text-secondary mb-4">Gioco non trovato.</p>
        <button onClick={() => navigate(-1)} className="px-4 py-2 bg-accent-primary text-white rounded-lg">Torna indietro</button>
      </div>
    );
  }

  // Mostra CommunityStats subito sotto le info generali
  return (
    <GamePageLayout 
      title={game.title} 
      parentPath="/catalog"
      parentLabel="Catalogo"
    >
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Pulsante Indietro integrato in alto a sinistra */}
        <button 
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-text-secondary hover:text-accent-primary transition-colors group"
        >
          <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Indietro</span>
        </button>
        {/* Game Header - 3 colonne come da wireframe */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">          {/* Colonna 1: Cover Image */}
          <div className="flex justify-center lg:justify-start items-start">
            <div className="relative">
              <img 
                src={game.CoverImage || "/placeholder.svg"} 
                alt={game.title} 
                className="w-full max-w-[420px] h-[520px] object-cover rounded-xl shadow-lg"
              />
            </div>
          </div>
          {/* Colonna 2: Game Info */}
          <div className="flex flex-col gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold text-text-primary">{game.title}</h1>
              </div>
              <div className="text-lg text-accent-primary font-semibold mb-1">{game.Publisher}</div>
              <div className="text-base text-text-secondary mb-3">
                {game.Developer} • {game.ReleaseYear}
              </div>
            </div>

            <GenreTagList Genres={game.Genres.map((g: any) => typeof g === 'string' ? g : g.name)} maxDisplay={6} small={false} />

            <div className="text-text-primary text-base leading-relaxed">
              {descriptionToShow}
              {isDescriptionLong && (
                <button
                  className="ml-2 text-accent-primary underline text-sm"
                  onClick={() => setShowFullDescription(v => !v)}
                >
                  {showFullDescription ? 'Mostra meno' : 'Mostra altro'}
                </button>
              )}            </div>          
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-400" />
                <span className="font-semibold text-lg text-text-primary">{formatMetacriticScore(game.Metacritic)}</span>
                <span className="text-sm text-text-secondary">Metacritic</span>
              </div>
            </div><div className="text-sm text-text-secondary">
              <span className="font-medium">Piattaforme:</span> {game.Platforms.join(', ')}
            </div>
          </div>

          {/* Colonna 3: Actions & Status */}
          <div className="flex flex-col gap-4 justify-end items-end relative">
            {isInLibrary && (
              <span
                className="absolute left-0 top-0 bg-accent-primary text-white px-4 py-2 rounded-full flex items-center gap-2 text-base font-semibold whitespace-nowrap truncate hover:bg-accent-secondary transition-colors cursor-pointer z-10"
                onClick={() => {
                  if (userGameByTitle) navigate(`/library/${encodeURIComponent(userGameByTitle.Title.replace(/ /g, '_'))}`);
                }}
                title="Vai alla tua copia in libreria"
              >
                <BookOpen className="w-5 h-5" /> In libreria
              </span>
            )}
            {!isInLibrary && (
              <button className="w-full bg-accent-primary hover:bg-accent-secondary text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors">
                <Plus className="w-5 h-5" />
                Aggiungi alla libreria
              </button>
            )}
          </div>
        </div>
        {/* Community Stats subito sotto le info generali */}
        <CommunityStats GameTitle={game.title} />
        {/* Content Grid - 60%/40% come da wireframe */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8 mt-8">
          {/* Main Content - 60% (3/5 columns) */}
          <div className="xl:col-span-3 space-y-8">
            {/* Recensione personale se presente */}
            {personalReview && (
              <PersonalReviewCard personalReview={personalReview} />
            )}
            {/* Community Reviews reali */}
            <CommunityReviewsSection 
              GameTitle={game.title}
            />
          </div>
          {/* Sidebar - 40% (2/5 columns) */}
          <div className="xl:col-span-2 space-y-6">
            <SimilarGamesCard currentGame={game} />
          </div>
        </div>
      </div>
    </GamePageLayout>
  );
};

export default GameInfoPage;
