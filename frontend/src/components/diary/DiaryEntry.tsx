import React, { useState, useEffect } from 'react';
import { Activity } from '../../types/activity';
import { Game } from '../../types/game';
import { Gamepad2, Trophy, Star, X, Check, ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react';
import RatingStars from '../ui/atoms/RatingStars';
import { useGameById, useGameActions } from '../../store/hooks/gamesHooks';
import { useGameByIdFetch } from '../../store/hooks/useGameByIdFetch';
import { calculateRatingFromReview } from '../../utils/gamesUtils';
import { isFirstActivityInMonth, getActivityIcon } from '../../utils/activityUtils';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { Link } from 'react-router-dom';

interface DiaryEntryProps {
  activity: Activity;
  showCoverImage?: boolean;
  allActivities?: Activity[];
  // Privacy context per profili pubblici
  publicProfile?: {
    canViewDiary: boolean;
    isFriend: boolean;
    isOwnProfile: boolean;
  };
}

const DiaryEntry: React.FC<DiaryEntryProps> = ({ 
  activity, 
  showCoverImage = true, 
  allActivities = [],
  publicProfile 
}) => {
  const [expandedReview, setExpandedReview] = useState(false);
    // Prima tenta di ottenere il gioco dalla libreria locale
  const localGame = useGameById(activity.gameId);
  
  // Se non è presente nella libreria locale, tenta di recuperarlo dall'API
  const { game: fetchedGame, loading: fetchLoading } = useGameByIdFetch(!localGame ? activity.gameId : null);
  
  // Usa il gioco locale se disponibile, altrimenti quello recuperato dall'API
  const game = localGame || fetchedGame;
    const dispatch = useAppDispatch();
  const userProfile = useAppSelector(state => state.user.profile);
  const isDiaryPrivate = userProfile?.privacySettings?.showDiary === false;
  const { update: updateGame } = useGameActions();// Logica per determinare se mostrare la recensione
  const shouldShowReview = () => {
    // Se non c'è una recensione, non mostrare nulla
    if (!game?.Review) {
      return false;
    }
    
    // Se siamo nel profilo proprio, mostra sempre
    if (!publicProfile || publicProfile.isOwnProfile) {
      return true;
    }
    
    // Per i giochi fetchati (non nella libreria locale)
    // Il backend ha già applicato tutte le regole di privacy
    // Se la recensione è arrivata dal backend, significa che possiamo mostrarla
    if (fetchedGame && fetchedGame.Review) {
      return true;
    }
    
    // INIZIO CONTROLLI DI PRIVACY
    // Per i giochi nella libreria locale, dobbiamo applicare le regole lato client
    // che rispecchiano la logica del backend
      // 1. Regola base: Le recensioni private non sono mai visibili agli altri
    const isReviewPublic = game.Review.IsPublic ?? false;
    if (!isReviewPublic) {
      return false;
    }
    
    // 2. Regola dei profili privati: Solo gli amici possono vedere i contenuti
    const isPrivateProfile = !publicProfile.canViewDiary; // Assunzione semplificata
    const isFriend = publicProfile.isFriend;
    
    if (isPrivateProfile && !isFriend) {
      return false;
    }
    
    // 3. Regola del diario privato: Solo gli amici possono vedere le recensioni nei diari privati
    const isDiaryPrivate = !publicProfile.canViewDiary;
    
    if (isDiaryPrivate && !isFriend) {
      return false;
    }
    
    // Tutti i controlli sono passati, la recensione è visibile
    return true;
  };
    // Non procedere se non c'è il gioco
  if (!game) return null;

  // Determina se il gioco è nella libreria locale (per mostrare/nascondere il link)
  const isLocalGame = !!localGame;
  
  // Per le attività di tipo "Played", controlla se è la prima volta nel mese usando la funzione di utilità
  if (activity.type === 'Played') {
    // Mostra l'attività "Played" solo se è la prima nel mese o se non ci sono dati per confrontare
    const isFirstPlayInMonth = isFirstActivityInMonth(activity, allActivities, 'Played');
    if (!isFirstPlayInMonth && allActivities.length > 0) return null;
  }

  const getDiaryEntryLabel = () => {
    switch (activity.type) {
      case 'Played': {
        const isFirstInMonth = isFirstActivityInMonth(activity, allActivities, 'Played');
        return isFirstInMonth ? 'Prima sessione del mese' : 'Giocato';
      }
      case 'Platinum':
        return 'Platinato';
      case 'Rated':
        return 'Recensito';     
      case 'Abandoned':
        return 'Abbandonato';
      case 'Completed':
        return 'Completato';
      case 'Added':
        return 'Aggiunto';
      default:
        return '';
    }
  };  // Per le attività di tipo "Rated" (recensione), mostra la recensione se esiste,
  // anche per i giochi di altri utenti (ottenuta tramite useGameByIdFetch) solo se è pubblica
  const hasReview = activity.type === 'Rated' && !!game.Review && !!game.Review.Text;
  // Determina se mostrare la recensione in base alle impostazioni di privacy
  const showReview = hasReview && shouldShowReview();

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
      <div className="flex-1 min-w-0">        <div className="flex items-center gap-2 mb-1">
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
          )}{/* Mostra anno e piattaforma se disponibili */}
          {game.ReleaseYear && (
            <span className="text-xs text-text-secondary">({game.ReleaseYear})</span>
          )}
          {game.Platform && (
            <span className="text-xs text-text-secondary">{game.Platform}</span>
          )}
        </div>
          <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center gap-1">
            {getActivityIcon(activity.type)}
            <span className="text-xs font-medium text-text-primary">{getDiaryEntryLabel()}</span>
          </div>
            {/* Mostra ore di gioco per le attività di tipo "Played" */}
          {activity.type === 'Played' && activity.additionalInfo && (
            <span className="text-xs text-text-secondary">
              ({activity.additionalInfo.replace(/:(\d+)/, ': $1').replace(/:(\s*)/, ': ')})
            </span>
          )}
          
          {/* Per attività "Added", mostra le informazioni aggiuntive (piattaforma, anno, prezzo) */}
          {activity.type === 'Added' && activity.additionalInfo && (
            <span className="text-xs text-text-secondary">
              ({activity.additionalInfo})
            </span>
          )}
            {/* Per attività "Rated", mostra il rating */}      
            {activity.type === 'Rated' && (
            <span className="text-xs text-text-secondary">
              {activity.additionalInfo ? (
                `(${activity.additionalInfo})`
              ) : (game.HoursPlayed && game.HoursPlayed > 0) ? (
                `(Recensito dopo ${game.HoursPlayed} ore di gioco)`
              ) : null}
            </span>
          )}{/* Per completati, mostra il tempo impiegato per finirlo */}          {activity.type === 'Completed' && (
            <span className="text-xs text-text-secondary">
              {activity.additionalInfo ? (
                `(${activity.additionalInfo})`
              ) : (game.HoursPlayed && game.HoursPlayed > 0) ? (
                `(Completato in ${game.HoursPlayed} ore)`
              ) : null}
            </span>
          )}
            {/* Per platinati, mostra il tempo impiegato */}  
            {activity.type === 'Platinum' && (
            <span className="text-xs text-text-secondary">
              {activity.additionalInfo ? (
                `(${activity.additionalInfo})`
              ) : (game.HoursPlayed && game.HoursPlayed > 0) ? (
                `(Platinato in ${game.HoursPlayed} ore)`
              ) : null}
            </span>
          )}
          
          {/* Per abbandonati, mostra le informazioni aggiuntive */}
          {activity.type === 'Abandoned' && activity.additionalInfo && (
            <span className="text-xs text-text-secondary">
              ({activity.additionalInfo})
            </span>
          )}
        </div>
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
            )}          </div>
        )}
          {/* Indicatore di recensione privata (quando esiste ma non è visibile) */}
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
        
        {/* Recensione */}
        {showReview && (
          <div className="bg-secondary-bg p-3 rounded-lg mt-2">            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium text-text-primary">Recensione</span>
              </div>
              {/* Mostra stelle solo se review presente */}
              <RatingStars Rating={calculateRatingFromReview(game.Review!)} />
            </div>
            <p className={`text-xs text-text-secondary ${!expandedReview ? 'line-clamp-2' : ''}`}>
              {game.Review!.Text}
            </p>
            {game.Review && game.Review.Text && game.Review.Text.length > 100 && (
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