import React from 'react';
import { Eye, EyeOff, Star, Calendar, Trophy, Gamepad2, Palette, BookOpen, Volume2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { useLoadSingleGameByTitle, useGameActions } from '../../../store/hooks/gamesHooks';
import { useReviewComments } from '../../../store/hooks/communityHooks';
import ReviewCommentsSection from './ReviewCommentsSection';

interface PersonalReview {
  Text: string;
  Gameplay: number;
  Graphics: number;
  Story: number;
  Sound: number;
  Date: string;
  IsPublic?: boolean;
  title: string;
}

interface PersonalReviewCardProps {
  personalReview: PersonalReview;
}

const PersonalReviewCard: React.FC<PersonalReviewCardProps> = ({ personalReview }) => {
  const dispatch = useAppDispatch();
  const { game } = useLoadSingleGameByTitle(personalReview.title);
  const IsPublic = game?.Review?.IsPublic ?? false;
  const userProfile = useAppSelector(state => state.user.profile);
  const isDiaryPrivate = userProfile?.privacySettings?.showDiary === false;  const { update: updateGame } = useGameActions();
  // Forza la privacy a privata se il diario è privato
  const effectiveIsPublic = isDiaryPrivate ? false : IsPublic;
    // Ottieni il conteggio dei commenti solo se la recensione è pubblica
  const { data: comments = [] } = useReviewComments(
    game && effectiveIsPublic ? game.id : 0
  );
  const commentsCount = comments.length;// Calcola la valutazione media
  const averageRating = (personalReview.Gameplay + personalReview.Graphics + personalReview.Story + personalReview.Sound) / 4;
  
  // Funzione per ottenere il colore in base al punteggio
  const getRatingColor = (rating: number) => {
    if (rating >= 8) return 'text-green-500';
    if (rating >= 6) return 'text-yellow-500';
    if (rating >= 4) return 'text-orange-500';
    return 'text-red-500';
  };

  // Componente Badge per le valutazioni
  const RatingBadge = ({ icon: Icon, label, value }: { icon: any, label: string, value: number }) => (
    <div className="flex flex-col items-center p-3 bg-gradient-to-br from-primary-bg to-secondary-bg rounded-xl border border-border-color hover:border-accent-primary/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 group">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-4 h-4 text-accent-primary group-hover:text-accent-secondary transition-colors" />
        <span className="text-xs font-medium text-text-secondary group-hover:text-text-primary transition-colors">{label}</span>
      </div>
      <div className={`text-lg font-bold ${getRatingColor(value)} group-hover:scale-110 transition-transform`}>
        {value.toFixed(1)}
      </div>
    </div>
  );

  return (
    <div className="bg-gradient-to-br from-secondary-bg via-secondary-bg to-primary-bg p-6 rounded-2xl border border-border-color shadow-lg hover:shadow-xl transition-all duration-300">
      {/* Header con titolo e controllo privacy */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-accent-primary to-accent-secondary rounded-xl">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-xl text-text-primary">La tua recensione</h3>
            <div className="flex items-center gap-2 mt-1">
              <Star className={`w-4 h-4 ${getRatingColor(averageRating)}`} />
              <span className={`text-sm font-semibold ${getRatingColor(averageRating)}`}>
                {averageRating.toFixed(1)}/5
              </span>
              <span className="text-xs text-text-secondary">media generale</span>
            </div>
          </div>
        </div>        {/* Controllo Privacy */}
        {game?.Review && (
          <div className="flex flex-col items-end gap-1">
            <button
              type="button"
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                isDiaryPrivate 
                  ? 'opacity-60 cursor-not-allowed text-text-disabled bg-gray-500/10' 
                  : effectiveIsPublic 
                    ? 'text-green-600 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20'
                    : 'text-orange-600 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20'
              } focus:outline-none focus:ring-2 focus:ring-accent-primary/30`}
              title={
                isDiaryPrivate 
                  ? 'Per modificare la privacy delle recensioni, rendi pubblico il tuo diario nelle impostazioni.' 
                  : (effectiveIsPublic ? 'Rendi privata la recensione' : 'Rendi pubblica la recensione')
              }
              onClick={() => {
                if (game && game.Review && !isDiaryPrivate) {
                  updateGame(game.id, { 
                    Review: { 
                      ...game.Review, 
                      IsPublic: !effectiveIsPublic 
                    } 
                  });
                }
              }}
              disabled={isDiaryPrivate}
            >
              {effectiveIsPublic ? (
                <Eye className="w-4 h-4" />
              ) : (
                <EyeOff className="w-4 h-4" />
              )}
              <span className="text-xs font-semibold">{effectiveIsPublic ? 'Pubblica' : 'Privata'}</span>
            </button>
            <span className="text-xs text-text-secondary">
              {effectiveIsPublic ? 'Visibile nella community' : 'Solo per te'}
            </span>
          </div>
        )}
      </div>      {/* Testo della recensione con design migliorato */}
      <div className="mb-6">
        <div className="bg-gradient-to-r from-primary-bg to-secondary-bg p-4 rounded-xl border border-border-color">
          <p className="text-base text-text-primary leading-relaxed font-medium">
            {personalReview.Text}
          </p>
        </div>
      </div>

      {/* Grid delle valutazioni con design moderno */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <RatingBadge 
          icon={Gamepad2} 
          label="Gameplay" 
          value={personalReview.Gameplay} 
        />
        <RatingBadge 
          icon={Palette} 
          label="Grafica" 
          value={personalReview.Graphics} 
        />
        <RatingBadge 
          icon={BookOpen} 
          label="Storia" 
          value={personalReview.Story} 
        />
        <RatingBadge 
          icon={Volume2} 
          label="Audio" 
          value={personalReview.Sound} 
        />
      </div>      {/* Data della recensione con stile migliorato */}
      <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-gradient-to-r from-accent-primary/5 to-accent-secondary/5 rounded-lg border border-accent-primary/10">
        <Calendar className="w-4 h-4 text-accent-primary" />
        <span className="text-sm text-text-secondary font-medium">
          Recensito il {new Date(personalReview.Date).toLocaleDateString('it-IT', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </span>
      </div>      
      {/* Comments Section - Solo se la recensione è pubblica */}
      {game && effectiveIsPublic && (
        <div className="border-t border-border-color pt-4">
          <ReviewCommentsSection 
            reviewGameId={game.id} 
            commentsCount={commentsCount}
          />
        </div>
      )}
    </div>
  );
};

export default PersonalReviewCard;
