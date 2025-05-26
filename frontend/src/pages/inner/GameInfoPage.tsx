import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGameReviewsStats, useGameByTitle } from "../../store/hooks/gamesHooks";
import { useCommunityReviewsByGame, useCommunityStatsByGame, useCommunityActions } from "../../store/hooks/communityHooks";
import { Award, Plus, Users, Star, Clock, Trophy, Gamepad2, ArrowLeft } from "lucide-react";
import CommunityReviewsSection from "../../components/catalog/gameinfo/CommunityReviewsSection";
import SimilarGamesCard from "../../components/catalog/gameinfo/SimilarGamesCard";
import PersonalReviewCard from "../../components/catalog/gameinfo/PersonalReviewCard";
import GamePageLayout from "../../components/game/layout/GamePageLayout";
import GenreTagList from "../../components/ui/GenreTagList";
import { BookOpen } from "lucide-react";
import type { PublicCatalogGame } from "../../data/gamesData";
import CommunityStats from "../../components/catalog/gameinfo/CommunityStats";
import type { CommunityReview } from '../../store/slice/communitySlice';
import { catalogGames } from '../../data/gamesData';

const GameInfoPage: React.FC = () => {
  const { title } = useParams<{ title: string }>();
  const navigate = useNavigate();
  const decodedTitle = title ? decodeURIComponent(title.replace(/_/g, ' ')) : '';
  const { avg, count } = useGameReviewsStats(decodedTitle);
  const communityReviews = useCommunityReviewsByGame(decodedTitle);
  const communityStats = useCommunityStatsByGame(decodedTitle);
  const game = catalogGames.find((g: PublicCatalogGame) => g.title === decodedTitle);
  const userGame = useGameByTitle(decodedTitle);

  if (!title) {
  
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-lg text-text-secondary mb-4">Gioco non trovato (nessun titolo specificato).</p>
        <button onClick={() => navigate(-1)} className="px-4 py-2 bg-accent-primary text-white rounded-lg">Torna indietro</button>
      </div>
    );
  }
  if (!game) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-lg text-text-secondary mb-4">Gioco non trovato.</p>
        <button onClick={() => navigate(-1)} className="px-4 py-2 bg-accent-primary text-white rounded-lg">Torna indietro</button>
      </div>
    );
  }
  const isInLibrary = !!userGame;

  const shortDescription = game.description || "Nessuna descrizione disponibile.";
  const publisher = game.publisher || "Publisher sconosciuto";
  const developer = game.developer || "Sviluppatore sconosciuto";
  const platforms = game.platforms && game.platforms.length > 0 ? game.platforms.join(', ') : 'Non specificate';
  // Recupera la recensione personale dell’utente (se presente) e aggiungi gameId
  const personalReview = userGame && userGame.review
    ? { ...userGame.review, title: userGame.title }
    : undefined;

  let personalCommunityReview: CommunityReview | null = null;
  if (userGame && userGame.review && userGame.review.isPublic) {
    personalCommunityReview = {
      id: -1, // id fittizio
      username: 'Tu',
      avatar: undefined,
      rating: userGame.rating ?? 0,
      text: userGame.review.text || '',
      date: userGame.review.date || '',
      platform: userGame.platform || '',
      gameplay: userGame.review.gameplay ?? 0,
      graphics: userGame.review.graphics ?? 0,
      story: userGame.review.story ?? 0,
      sound: userGame.review.sound ?? 0,
      gameTitle: userGame.title
    };
  }
  let reviewsToShow = communityReviews;
  if (personalCommunityReview) {
    const alreadyPresent = communityReviews.some(r => r.username === personalCommunityReview!.username || r.id === personalCommunityReview!.id);
    if (!alreadyPresent) {
      reviewsToShow = [personalCommunityReview, ...communityReviews];
    }
  }

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
          <div className="flex justify-center lg:justify-start">
            <div className="relative">
              <img 
                src={game.coverImage || "/placeholder.svg"} 
                alt={game.title} 
                className="w-64 h-80 object-cover rounded-xl shadow-lg"
              />
            </div>
          </div>          {/* Colonna 2: Game Info */}
          <div className="flex flex-col gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold text-text-primary">{game.title}</h1>
                {isInLibrary && (
                  <span
                    className="bg-accent-primary text-white px-3 py-1 rounded-full flex items-center gap-1 text-sm font-semibold cursor-pointer whitespace-nowrap truncate hover:bg-accent-secondary transition-colors"
                    onClick={() => {
                      if (userGame) navigate(`/library/${encodeURIComponent(userGame.title.replace(/ /g, '_'))}`);
                    }}
                    title="Vai alla tua copia in libreria"
                  >
                    <BookOpen className="w-4 h-4" /> In libreria
                  </span>
                )}
              </div>
              <div className="text-lg text-accent-primary font-semibold mb-1">{publisher}</div>
              <div className="text-base text-text-secondary mb-3">
                {developer} • {game.releaseYear}
              </div>
            </div>

            <GenreTagList genres={game.genres} maxDisplay={6} small={false} />

            <div className="text-text-primary text-base leading-relaxed">
              {shortDescription}
            </div>

            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-400" />
                <span className="font-semibold text-lg text-text-primary">{game.metacritic}</span>
                <span className="text-sm text-text-secondary">Metacritic</span>
              </div>
            </div>            <div className="text-sm text-text-secondary">
              <span className="font-medium">Piattaforme:</span> {platforms}
            </div>
          </div>

          {/* Colonna 3: Actions & Status */}
          <div className="flex flex-col gap-4 justify-end">
            {!isInLibrary && (
              <button className="w-full bg-accent-primary hover:bg-accent-secondary text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors">
                <Plus className="w-5 h-5" />
                Aggiungi alla libreria
              </button>
            )}
          </div></div>        {/* Community Statistics - Layout orizzontale */}
        <CommunityStats gameTitle={game.title} />

        {/* Content Grid - 60%/40% come da wireframe */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
          {/* Main Content - 60% (3/5 columns) */}
          <div className="xl:col-span-3 space-y-8">            {/* Recensione personale se presente */}
            {personalReview && (
              <PersonalReviewCard personalReview={personalReview} />
            )}            <CommunityReviewsSection 
              gameTitle={game.title}
              reviews={reviewsToShow}
              averageRating={communityStats?.averageRating || avg}
              totalReviews={communityStats?.totalReviews || count}
            />
          </div>{/* Sidebar - 40% (2/5 columns) */}
          <div className="xl:col-span-2 space-y-6">
            <SimilarGamesCard currentGame={game} similarGames={catalogGames} />          </div>
        </div>
      </div>
    </GamePageLayout>
  );
};

export default GameInfoPage;
