import { Activity } from '../../../types/activity';
import { formatShortDate } from '../../../utils/dateUtils';
import { getActivitytext } from '../../../utils/activityUtils';

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
              activity.Timestamp, 
              previousActivity?.Timestamp,
              isLastActivity
            )}:
          </span>
        )}
        <span className="text-xs font-secondary text-text-primary">
          {getActivitytext(activity)}
        </span>
      </div>
    </div>
  );
};

export default ActivityTimelineItem;
