import React, { ReactNode } from 'react';
import { Activity } from '../../types/activity';
import { formatRelativeTime, getActivityText, getActivityIcon } from '../../utils/activitiesData';

interface ActivityCardProps {
  activity: Activity;
  position?: 'left' | 'right';
  showIcon?: boolean;
  compact?: boolean;
  className?: string;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ 
  activity, 
  position = 'left', 
  showIcon = true, 
  compact = false,
  className = ''
}) => {
  // Recupera i dati dell'attività
  const activityText = getActivityText(activity);
  const formattedTime = formatRelativeTime(activity.timestamp);
  const icon = showIcon ? getActivityIcon(activity.type) : null;
  
  return (
    <div className={`bg-primaryBg border border-border-color rounded-lg shadow-sm hover:shadow-md transition-shadow ${compact ? 'p-3' : 'p-4'} ${className}`}>
      <div className="flex items-center justify-between">
        <div className={`flex-grow ${position === 'right' && showIcon ? 'text-right' : ''}`}>
          <div className={`text-sm text-text-primary font-medium font-secondary ${compact ? 'line-clamp-1' : ''}`}>
            {activityText}
          </div>
          <div className="text-xs text-text-secondary mt-1">{formattedTime}</div>
        </div>
        
        {showIcon && (
          <div className={`flex-shrink-0 ${position === 'right' ? 'mr-4 order-first' : 'ml-4'}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityCard;
