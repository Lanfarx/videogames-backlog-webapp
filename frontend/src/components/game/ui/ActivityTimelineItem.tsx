import { Activity } from '../../../types/activity';
import { formatShortDate } from '../../../utils/dateUtils';
import { getActivityText } from '../../../utils/activitiesData';

interface ActivityTimelineItemProps {
  activity: Activity;
  showDate?: boolean;
  previousActivity?: Activity;
  isLastActivity?: boolean;
}

const ActivityTimelineItem = ({ 
  activity, 
  showDate = true,
  previousActivity,
  isLastActivity = false
}: ActivityTimelineItemProps) => {
  return (
    <div className="flex items-center">
      <div>
        {showDate && (
          <span className="text-xs font-secondary text-text-secondary mr-1">
            {formatShortDate(
              activity.timestamp, 
              previousActivity?.timestamp,
              isLastActivity
            )}:
          </span>
        )}
        <span className="text-xs font-secondary text-text-primary">
          {getActivityText(activity)}
        </span>
      </div>
    </div>
  );
};

export default ActivityTimelineItem;
