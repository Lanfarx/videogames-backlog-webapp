import { useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { Activity } from '../../../types/activity';
import ActivityTimelineItem from './ActivityTimelineItem';

interface ActivityHistoryPopoverProps {
  activities: Activity[];
  onClose: () => void;
  gameTitle: string;
}

const ActivityHistoryPopover = ({ activities, onClose, gameTitle }: ActivityHistoryPopoverProps) => {
  const popoverRef = useRef<HTMLDivElement>(null);

  // Chiudi il popover quando si clicca fuori
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // Ordina le attività per data (dalla più recente alla più vecchia)
  const sortedActivities = [...activities].sort((a, b) => 
    b.timestamp.getTime() - a.timestamp.getTime()
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div 
        ref={popoverRef}
        className="bg-primaryBg border border-border-color rounded-xl p-6 max-w-lg w-full max-h-[80vh] overflow-auto shadow-lg"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-primary font-semibold text-xl text-text-primary">
            Cronologia attività: {gameTitle}
          </h3>
          <button 
            onClick={onClose}
            className="text-text-secondary hover:text-accent-primary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {sortedActivities.length > 0 ? (
          <div className="space-y-4">
            {sortedActivities.map((activity, i) => {
              const prevActivity = i > 0 ? sortedActivities[i-1] : undefined;
              const isLastActivity = i === sortedActivities.length - 1;
              
              return (
                <div key={activity.id} className="pb-4 border-b border-border-color last:border-0">
                  <ActivityTimelineItem 
                    activity={activity}
                    previousActivity={prevActivity}
                    isLastActivity={isLastActivity}
                  />
                  <div className="mt-1 ml-5 text-xs text-text-secondary font-secondary">
                    {activity.timestamp.toLocaleDateString('it-IT', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-text-secondary font-secondary text-sm">
            Nessuna attività registrata per questo gioco.
          </p>
        )}
      </div>
    </div>
  );
};

export default ActivityHistoryPopover;
