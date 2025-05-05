import { Activity } from '../../../types/activity';
import { formatRelativeTime } from '../../../utils/activitiesData';

interface TimelineItemProps {
  activity: Activity;
}

const TimelineItem = ({ activity }: TimelineItemProps) => {
  return (
    <div className="flex items-start mb-4">
      <div className="w-2 h-2 rounded-full bg-accent-primary mt-2 mr-3"></div>
      <div className="flex-1">
        <p className="font-secondary text-sm text-text-primary">{activity.additionalInfo}</p>
        <span className="font-secondary text-xs text-text-secondary">
          {formatRelativeTime(activity.timestamp)}
        </span>
      </div>
    </div>
  );
};

export default TimelineItem;
