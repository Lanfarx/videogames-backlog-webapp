import { Activity } from '../../types/activity';
import TimelineItem from './ui/TimelineItem';

interface GameTimelineCardProps {
  activities: Activity[];
}

const GameTimelineCard = ({ activities }: GameTimelineCardProps) => {
  return (
    <div className="bg-primary-bg border border-border-color rounded-xl p-6">
      <h2 className="font-primary font-semibold text-xl text-text-primary mb-4">
        Timeline di gioco
      </h2>
      
      <div className="pl-4 border-l-2 border-accent-primary/30">
        {activities.length > 0 ? (
          activities.map((activity) => (
            <TimelineItem key={activity.id} activity={activity} />
          ))
        ) : (
          <p className="font-secondary text-sm text-text-secondary">
            Nessuna attività registrata per questo gioco.
          </p>
        )}
      </div>
    </div>
  );
};

export default GameTimelineCard;
