import React from 'react';
import { Activity, ActivityWithReactions } from '../../types/activity';
import { Gamepad2, Star, EyeOff } from 'lucide-react';
import ReactionBar from './ReactionBar';
import ActivityCommentsSection from './ActivityCommentsSection';
import { useGameById } from '../../store/hooks/gamesHooks';
import { useGameByIdFetch } from '../../hooks/useGameByIdFetch';
import { getActivityIcon } from '../../utils/activityUtils';
import { Link } from 'react-router-dom';
import { DiaryEntryReview } from './DiaryEntryReview';
import { DiaryEntryNotes } from './DiaryEntryNotes';
import { shouldShowReview, getDiaryEntryLabel, PublicProfileContext } from './utils/diaryPrivacyUtils';

interface DiaryEntryProps {
  activity: Activity | ActivityWithReactions;
  showCoverImage?: boolean;
  allActivities?: Activity[];
  showReactions?: boolean;
  publicProfile?: PublicProfileContext;
}

export default function DiaryEntry({ 
  activity, 
  showCoverImage = true, 
  allActivities = [],
  showReactions = true,
  publicProfile 
}: DiaryEntryProps) {
  const localGame = useGameById(activity.gameId);
  const { game: fetchedGame } = useGameByIdFetch(!localGame ? activity.gameId : null);
  
  const game = localGame || fetchedGame;

  if (!game) return null;

  const isLocalGame = !!localGame;
  
  if (activity.type === 'Played' && getDiaryEntryLabel(activity, allActivities) === '') {
     return null;
  }

  const hasReview = activity.type === 'Rated' && !!game.Review && !!game.Review.Text;
  const showReview = hasReview && shouldShowReview(game, fetchedGame, publicProfile);

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
          {localGame && game.Title ? (
            <Link
              to={`/library/${encodeURIComponent(game.Title.replace(/ /g, '_'))}`}
              className="font-bold text-base text-accent-primary hover:underline truncate"
              title={game.Title}
            >
              {game.Title}
            </Link>
          ) : (
            <span className="font-bold text-base text-text-primary truncate" title={game.Title || 'Titolo non disponibile'}>
              {game.Title || 'Titolo non disponibile'}
            </span>
          )}

          {game.ReleaseYear && (
            <span className="text-xs text-text-secondary">({game.ReleaseYear})</span>
          )}
          {game.Platform && (
            <span className="text-xs text-text-secondary">{game.Platform}</span>
          )}

          {showReactions && (
            <ReactionBar
              activityId={activity.id}
              reactions={'reactions' in activity ? activity.reactions : []}
              reactionSummary={'reactionSummary' in activity ? activity.reactionSummary : []}
              isOwner={!publicProfile || publicProfile.isOwnProfile}
              className="ml-2"
            />
          )}
        </div>
        
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center gap-1">
            {getActivityIcon(activity.type)}
            <span className="text-xs font-medium text-text-primary">{getDiaryEntryLabel(activity, allActivities)}</span>
          </div>
          
          {activity.type === 'Played' && activity.additionalInfo && (
            <span className="text-xs text-text-secondary">
              ({activity.additionalInfo.replace(/:(\d+)/, ': $1').replace(/:(\s*)/, ': ')})
            </span>
          )}
          
          {activity.type === 'Added' && activity.additionalInfo && (
            <span className="text-xs text-text-secondary">
              ({activity.additionalInfo})
            </span>
          )}
          
          {activity.type === 'Rated' && (
            <span className="text-xs text-text-secondary">
              {activity.additionalInfo ? (
                `(${activity.additionalInfo})`
              ) : (game.HoursPlayed && game.HoursPlayed > 0) ? (
                `(Recensito dopo ${game.HoursPlayed} ore di gioco)`
              ) : null}
            </span>
          )}

          {activity.type === 'Completed' && (
            <span className="text-xs text-text-secondary">
              {activity.additionalInfo ? (
                `(${activity.additionalInfo})`
              ) : (game.HoursPlayed && game.HoursPlayed > 0) ? (
                `(Completato in ${game.HoursPlayed} ore)`
              ) : null}
            </span>
          )}
          
          {activity.type === 'Platinum' && (
            <span className="text-xs text-text-secondary">
              {activity.additionalInfo ? (
                `(${activity.additionalInfo})`
              ) : (game.HoursPlayed && game.HoursPlayed > 0) ? (
                `(Platinato in ${game.HoursPlayed} ore)`
              ) : null}
            </span>
          )}
          
          {activity.type === 'Abandoned' && activity.additionalInfo && (
            <span className="text-xs text-text-secondary">
              ({activity.additionalInfo})
            </span>
          )}
        </div>
        
        {(activity.type === 'Completed' || activity.type === 'Platinum') && game.Notes && (
          <DiaryEntryNotes notes={game.Notes} />
        )}
        
        {hasReview && !showReview && publicProfile && !publicProfile.isOwnProfile && (
          <div className="bg-secondary-bg p-3 rounded-lg mt-2">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-4 h-4 text-text-secondary" />
              <span className="text-sm font-medium text-text-secondary">Recensione</span>
              <span className="text-xs text-text-secondary ml-auto flex items-center">
                <EyeOff className="w-3 h-3 mr-1" />
                Privata
              </span>
            </div>
            <p className="text-xs text-text-secondary italic">
              Questa recensione è privata e non è visibile.
            </p>
          </div>
        )}
        
        {showReview && game.Review && (
          <DiaryEntryReview review={game.Review} />
        )}        

        {activity.type === 'Rated' && showReactions && (
          <div className="mt-4">
            <ActivityCommentsSection 
              activityId={activity.id}
              commentsCount={('commentsCount' in activity ? activity.commentsCount : 0) || 0}
              ownerId={game.UserId}
            />
          </div>
        )}
      </div>
    </div>
  );
}