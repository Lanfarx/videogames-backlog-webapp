import React, { useState } from 'react';
import { Activity } from '../../types/activity';
import { Game } from '../../types/game';
import { Gamepad2, Trophy, Star, X, Check, ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react';
import RatingStars from '../ui/atoms/RatingStars';
import { useGameById, useGameActions } from '../../store/hooks/gamesHooks';
import { calculateRatingFromReview } from '../../utils/gamesUtils';
import { isFirstActivityInMonth, getActivityIcon } from '../../utils/activityUtils';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { Link } from 'react-router-dom';

interface DiaryEntryProps {
  activity: Activity;
  showCoverImage?: boolean;
  allActivities?: Activity[];
}

const DiaryEntry: React.FC<DiaryEntryProps> = ({ activity, showCoverImage = true, allActivities = [] }) => {
  const [expandedReview, setExpandedReview] = useState(false);
  const game = useGameById(activity.gameId);  const dispatch = useAppDispatch();
  const userProfile = useAppSelector(state => state.user.profile);
  const isDiaryPrivate = userProfile?.privacySettings?.showDiary === false;
  const { update: updateGame } = useGameActions();
  
  // Non procedere se non c'è il gioco
  if (!game) return null;
  
  // Per le attività di tipo "played", controlla se è la prima volta nel mese usando la funzione di utilità
  if (activity.type === 'played') {
    // Mostra l'attività "played" solo se è la prima nel mese o se non ci sono dati per confrontare
    const isFirstPlayInMonth = isFirstActivityInMonth(activity, allActivities, 'played');
    if (!isFirstPlayInMonth && allActivities.length > 0) return null;
  }

  const getDiaryEntryLabel = () => {
    switch (activity.type) {
      case 'played': {
        const isFirstInMonth = isFirstActivityInMonth(activity, allActivities, 'played');
        return isFirstInMonth ? 'Prima sessione del mese' : 'Giocato';
      }
      case 'Platinum':
        return 'Platinato';
      case 'rated':
        return 'Recensito';
      case 'Abandoned':
        return activity.additionalInfo ? `Abbandonato (${activity.additionalInfo})` : 'Abbandonato';
      case 'Completed':
        return 'Completato';
      case 'added':
        return 'Aggiunto';
      default:
        return '';
    }
  };
  
  const hasReview = activity.type === 'rated' && game.Review;

  return (
    <div className="border-b border-border-color py-4 flex items-start gap-4">
      <div className="text-center w-10 flex-shrink-0">
        <div className="text-sm font-bold text-text-primary">
          {new Date(activity.timestamp).getDate()}
        </div>
        <div className="text-xs text-text-secondary">
          {new Date(activity.timestamp).toLocaleString('it-IT', { month: 'short' }).toUpperCase()}
        </div>
      </div>
      
      {showCoverImage && (
        <div className="w-16 h-24 flex-shrink-0 rounded overflow-hidden bg-secondary-bg">
          {game.CoverImage ? (
            <img 
              src={game.CoverImage} 
              alt={game.Title} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-tertiary-bg">
              <Gamepad2 className="w-6 h-6 text-text-secondary" />
            </div>
          )}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Link
            to={`/library/${encodeURIComponent(game.Title.replace(/ /g, '_'))}`}
            className="font-bold text-base text-accent-primary hover:underline truncate"
            title={game.Title}
          >
            {game.Title}
          </Link>
          <span className="text-xs text-text-secondary">({game.ReleaseYear})</span>
          <span className="text-xs text-text-secondary">{game.Platform}</span>
        </div>
        
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center gap-1">
            {getActivityIcon(activity.type)}
            <span className="text-xs font-medium">{getDiaryEntryLabel()}</span>
          </div>
          
          {/* Mostra ore di gioco per ogni tipo di attività */}
          {activity.type === 'played' && activity.additionalInfo && (
            <span className="text-xs text-text-secondary">
              ({activity.additionalInfo.replace(/:(\d+)/, ': $1').replace(/:(\s*)/, ': ')})
            </span>
          )}
          
          {/* Per completati, mostra il tempo impiegato per finirlo */}
          {activity.type === 'Completed' && (
            <span className="text-xs text-text-secondary">
              (Completato in {game.HoursPlayed} ore)
            </span>
          )}
          
          {/* Per platinati, mostra una stima del tempo di platino */}
          {activity.type === 'Platinum' && (
            <span className="text-xs text-text-secondary">
              (Platinato in {game.HoursPlayed} ore)
            </span>
          )}
          
          {/* Per recensioni, mostra le ore di gioco al momento della recensione */}
          {activity.type === 'rated' && (
            <span className="text-xs text-text-secondary">
              (Recensito dopo {game.HoursPlayed} ore di gioco)
            </span>
          )}
          
          {/* Le info per l'abbandono sono gestite nel testo dell'attività */}
          {activity.additionalInfo && activity.type !== 'Abandoned' && activity.type !== 'Completed' && activity.type !== 'Platinum' && activity.type !== 'rated' && activity.type !== 'played' && (
            <span className="text-xs text-text-secondary">({activity.additionalInfo})</span>
          )}
        </div>
        
        {/* Abbiamo rimosso il testo per gli abbandoni, viene mostrato direttamente nell'etichetta */}
        
        {/* Note per i giochi completati o platinati (se presenti) */}
        {(activity.type === 'Completed' || activity.type === 'Platinum') && game.Notes && (
          <div className="bg-secondary-bg p-3 rounded-lg mt-2">
            <div className="flex items-center mb-2">
              <span className="text-sm font-medium text-text-primary">Note</span>
            </div>
            <p className={`text-xs text-text-secondary ${!expandedReview ? 'line-clamp-2' : ''}`}>
              {game.Notes}
            </p>
            {game.Notes.length > 100 && (
              <button 
                className="flex items-center text-xs text-accent-primary mt-1 hover:underline"
                onClick={() => setExpandedReview(!expandedReview)}
              >
                {expandedReview ? (
                  <>
                    <ChevronUp className="w-3 h-3 mr-1" />
                    Mostra meno
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3 h-3 mr-1" />
                    Mostra tutto
                  </>
                )}
              </button>
            )}
          </div>
        )}
        
        {/* Recensione */}
        {hasReview && (
          <div className="bg-secondary-bg p-3 rounded-lg mt-2">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" />                
                <span className="text-sm font-medium text-text-primary">Recensione</span>
                <button
                  type="button"
                  className={`ml-2 text-text-secondary ${isDiaryPrivate ? 'opacity-60 cursor-not-allowed' : 'hover:text-accent-primary'} focus:outline-none`}
                  title={isDiaryPrivate ? 'Per modificare la privacy delle recensioni, rendi pubblico il tuo diario nelle impostazioni.' : (game.Review?.IsPublic ? 'Rendi privata la recensione' : 'Rendi pubblica la recensione')}                  onClick={() => {
                    if (game.Review && !isDiaryPrivate) {
                      updateGame(game.id, { 
                        Review: { 
                          ...game.Review, 
                          IsPublic: !game.Review.IsPublic 
                        } 
                      });
                    }
                  }}
                  disabled={isDiaryPrivate}
                >
                  {game.Review?.IsPublic ? (
                    <Eye className="w-4 h-4" />
                  ) : (
                    <EyeOff className="w-4 h-4" />
                  )}
                </button>
              </div>
              {game && (
                <RatingStars Rating={calculateRatingFromReview(game.Review)} />
              )}
            </div>
            <p className={`text-xs text-text-secondary ${!expandedReview ? 'line-clamp-2' : ''}`}>
              {game.Review?.Text}
            </p>
            {game.Review?.Text && game.Review.Text.length > 100 && (
              <button 
                className="flex items-center text-xs text-accent-primary mt-1 hover:underline"
                onClick={() => setExpandedReview(!expandedReview)}
              >
                {expandedReview ? (
                  <>
                    <ChevronUp className="w-3 h-3 mr-1" />
                    Mostra meno
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3 h-3 mr-1" />
                    Mostra tutto
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DiaryEntry;