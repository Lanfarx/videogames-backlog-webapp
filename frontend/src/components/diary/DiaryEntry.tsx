import React, { useState } from 'react';
import { Activity } from '../../types/activity';
import { Game } from '../../types/game';
import { Gamepad2, Trophy, Star, X, Check, ChevronDown, ChevronUp } from 'lucide-react';
import RatingStars from '../ui/atoms/RatingStars';
import { calculateRatingFromReview, getGameById } from '../../utils/gamesData';
import { isFirstActivityInMonth } from '../../utils/activityUtils';

interface DiaryEntryProps {
  activity: Activity;
  showCoverImage?: boolean;
  allActivities?: Activity[];
}

const DiaryEntry: React.FC<DiaryEntryProps> = ({ activity, showCoverImage = true, allActivities = [] }) => {
  const [expandedReview, setExpandedReview] = useState(false);
  const game = getGameById(activity.gameId);
  
  // Non procedere se non c'è il gioco
  if (!game) return null;
  
  // Per le attività di tipo "played", controlla se è la prima volta nel mese usando la funzione di utilità
  if (activity.type === 'played') {
    // Mostra l'attività "played" solo se è la prima nel mese o se non ci sono dati per confrontare
    const isFirstPlayInMonth = isFirstActivityInMonth(activity, allActivities, 'played');
    if (!isFirstPlayInMonth && allActivities.length > 0) return null;
  }

  const getActivityIcon = () => {
    switch (activity.type) {
      case 'played':
        return <Gamepad2 className="w-4 h-4 text-blue-500" />;
      case 'platinum':
        return <Trophy className="w-4 h-4 text-amber-500" />;
      case 'rated':
        return <Star className="w-4 h-4 text-yellow-500" />;
      case 'abandoned':
        return <X className="w-4 h-4 text-red-500" />;
      case 'completed':
        return <Check className="w-4 h-4 text-green-500" />;
      default:
        return <Gamepad2 className="w-4 h-4 text-accent-primary" />;
    }
  };

  const getActivityLabel = () => {
    switch (activity.type) {
      case 'played':
        // Verifica se è la prima volta che il gioco viene giocato nel mese usando la funzione di utilità
        const isFirstInMonth = isFirstActivityInMonth(activity, allActivities, 'played');
        return isFirstInMonth ? 'Prima sessione del mese' : 'Giocato';
      case 'platinum':
        return 'Platinato';
      case 'rated':
        return 'Recensito';
      case 'abandoned':
        return activity.additionalInfo ? `Abbandonato (${activity.additionalInfo})` : 'Abbandonato';
      case 'completed':
        return 'Completato';
      case 'added':
        return 'Aggiunto';
      default:
        return '';
    }
  };
  
  // Non abbiamo più bisogno di testi aggiuntivi poiché tutte le informazioni
  // sono ora mostrate direttamente accanto all'etichetta dell'attività
  const activityText: string | null = null;
  const isTextLong = false;
  const hasReview = activity.type === 'rated' && game.review;

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
          {game.coverImage ? (
            <img 
              src={game.coverImage} 
              alt={game.title} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-tertiary-bg">
              <Gamepad2 className="w-6 h-6 text-text-secondary" />
            </div>
          )}
        </div>
      )}
      
      <div className="flex-grow">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-text-primary">{game.title}</span>
          <span className="text-xs text-text-secondary">({game.releaseYear})</span>
          <span className="text-xs text-text-secondary">{game.platform}</span>
        </div>
        
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center gap-1">
            {getActivityIcon()}
            <span className="text-xs font-medium">{getActivityLabel()}</span>
          </div>
          
          {/* Mostra ore di gioco per ogni tipo di attività */}
          {activity.type === 'played' && activity.additionalInfo && (
            <span className="text-xs text-text-secondary">
              ({activity.additionalInfo})
            </span>
          )}
          
          {/* Per completati, mostra il tempo impiegato per finirlo */}
          {activity.type === 'completed' && (
            <span className="text-xs text-text-secondary">
              (Completato in {game.hoursPlayed} ore)
            </span>
          )}
          
          {/* Per platinati, mostra una stima del tempo di platino */}
          {activity.type === 'platinum' && (
            <span className="text-xs text-text-secondary">
              (Platinato in {game.hoursPlayed} ore)
            </span>
          )}
          
          {/* Per recensioni, mostra le ore di gioco al momento della recensione */}
          {activity.type === 'rated' && (
            <span className="text-xs text-text-secondary">
              (Recensito dopo {game.hoursPlayed} ore di gioco)
            </span>
          )}
          
          {/* Le info per l'abbandono sono gestite nel testo dell'attività */}
          {activity.additionalInfo && activity.type !== 'abandoned' && activity.type !== 'completed' && activity.type !== 'platinum' && activity.type !== 'rated' && activity.type !== 'played' && (
            <span className="text-xs text-text-secondary">({activity.additionalInfo})</span>
          )}
        </div>
        
        {/* Abbiamo rimosso il testo per gli abbandoni, viene mostrato direttamente nell'etichetta */}
        
        {/* Note per i giochi completati o platinati (se presenti) */}
        {(activity.type === 'completed' || activity.type === 'platinum') && game.notes && (
          <div className="bg-secondary-bg p-3 rounded-lg mt-2">
            <div className="flex items-center mb-2">
              <span className="text-sm font-medium text-text-primary">Note</span>
            </div>
            <p className={`text-xs text-text-secondary ${!expandedReview ? 'line-clamp-2' : ''}`}>
              {game.notes}
            </p>
            {game.notes.length > 100 && (
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
              </div>
              <RatingStars rating={calculateRatingFromReview(game.review)} />
            </div>
            <p className={`text-xs text-text-secondary ${!expandedReview ? 'line-clamp-2' : ''}`}>
              {game.review?.text}
            </p>
            {game.review?.text && game.review.text.length > 100 && (
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