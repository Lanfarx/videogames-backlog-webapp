import { useState } from "react";
import { Activity } from '../../types/activity';
import { Game } from '../../types/game';
import { History } from 'lucide-react';
import ActivityTimelineItem from './ui/ActivityTimelineItem';
import ActivitiesHistoryPopover from '../ui/activities/ActivitiesHistoryPopover';
import TimelineCanvas from './ui/TimelineCanvas';
import { useTimelineData } from '../../hooks/useTimelineData';

interface GameTimelineCardProps {
  activities?: Activity[];
  game: Game;
}

const GameTimelineCard = ({ activities = [], game }: GameTimelineCardProps) => {
  const [showHistoryPopover, setShowHistoryPopover] = useState(false);
  
  const hasActivities = activities && activities.length > 0;
  const isNotStarted = game?.Status === "NotStarted";
  
  const { optimizedGraphData, keyEvents } = useTimelineData(activities, game);
  
  if (!game) {   
     return (
      <div className="bg-primary-bg border border-border-color rounded-xl p-6">
        <p className="font-secondary text-sm text-text-secondary">
          Errore: Dati del gioco non disponibili
        </p>
      </div>
    );
  }
  
  return (
    <div className="bg-primary-bg border border-border-color rounded-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-primary font-semibold text-xl text-text-primary">
          Timeline di Gioco
        </h2>
        {hasActivities && (
          <button 
            onClick={() => setShowHistoryPopover(true)}
            className="flex items-center text-text-secondary hover:text-accent-primary transition-colors"
            title="Visualizza tutte le attività"
          >
            <History className="h-5 w-5" />
          </button>
        )}
      </div>
      
      <div>
        <div className="h-64 relative mb-8">
          <TimelineCanvas 
            game={game} 
            graphData={optimizedGraphData} 
            hasActivities={hasActivities} 
            isNotStarted={isNotStarted} 
          />
        </div>
        
        {keyEvents.length > 0 && (
          <div>
            <h3 className="font-primary font-medium text-base text-text-primary mb-3">
              Eventi chiave
            </h3>
            
            <div className="space-y-3">
              {keyEvents.map((activity, i) => {
                const prevActivity = i > 0 ? keyEvents[i-1] : undefined;
                const isLastEvent = i === keyEvents.length - 1;
                return (
                  <ActivityTimelineItem 
                    key={`${activity.id}-${i}`}
                    activity={activity}
                    previousActivity={prevActivity}
                    isLastActivity={isLastEvent}
                  />
                );
              })}
            </div>
          </div>
        )}
          
        {!hasActivities && isNotStarted && (
          <div className="text-center py-8">
            <p className="font-secondary text-sm text-text-secondary mb-2">
              Questo gioco non è ancora stato iniziato
            </p>
            <p className="font-secondary text-xs text-text-secondary">
              Le attività di gioco appariranno qui una volta che inizierai a giocare
            </p>
          </div>
        )}
        
        {!hasActivities && !isNotStarted && game && game.HoursPlayed > 0 && (
          <div className="text-center py-8">
            <p className="font-secondary text-sm text-text-secondary mb-2">
              Ore di gioco registrate: {game.HoursPlayed}h
            </p>
            <p className="font-secondary text-xs text-text-secondary">
              Le nuove attività di gioco appariranno qui quando giocherai di più
            </p>
          </div>
        )}
        
        {!hasActivities && !isNotStarted && (!game || game.HoursPlayed === 0) && (
          <div className="text-center py-8">
            <p className="font-secondary text-sm text-text-secondary">
              Nessuna attività registrata per questo gioco.
            </p>
          </div>
        )}
      </div>
      
      {showHistoryPopover && game && (
        <ActivitiesHistoryPopover 
          gameId={game.id}
          onClose={() => setShowHistoryPopover(false)}
          GameTitle={game.Title}
        />
      )}
    </div>
  );
};

export default GameTimelineCard;
