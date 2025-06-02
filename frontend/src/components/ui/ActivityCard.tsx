import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Activity } from '../../types/activity';
import { formatRelativeTime } from '../../utils/dateUtils';
import { getActivitytext, getActivityIcon } from '../../utils/activityUtils';

interface ActivityCardProps {
  activity: Activity;
  position?: 'left' | 'right';
  showIcon?: boolean;
  compact?: boolean;
  className?: string;
}

// Funzione helper per dividere il testo dell'attività e il nome del gioco
const parseActivityText = (activity: Activity) => {
  const fullText = getActivitytext(activity);
  const gameTitle = activity.GameTitle;
  
  // Trova la posizione del nome del gioco nel testo
  const gameIndex = fullText.indexOf(gameTitle);
  
  if (gameIndex === -1) {
    // Se per qualche motivo il nome del gioco non è nel testo, restituisci tutto come prefisso
    return { prefix: fullText, suffix: '' };
  }
  
  const prefix = fullText.substring(0, gameIndex);
  const suffix = fullText.substring(gameIndex + gameTitle.length);
  
  return { prefix, suffix };
};

const ActivityCard: React.FC<ActivityCardProps> = ({ 
  activity, 
  position = 'left', 
  showIcon = true, 
  compact = false,
  className = ''
}) => {
  // Recupera i dati dell'attività
  const formattedTime = formatRelativeTime(activity.Timestamp);
  const icon = showIcon ? getActivityIcon(activity.Type) : null;
  const { prefix, suffix } = parseActivityText(activity);
  
  // Genera il link alla pagina del gioco
  const gamePageUrl = `/library/${encodeURIComponent(activity.GameTitle.replace(/ /g, '_'))}`;
  
  return (
    <div className={`bg-primaryBg border border-border-color rounded-lg shadow-sm hover:shadow-md transition-shadow ${compact ? 'p-3' : 'p-4'} ${className}`}>
      <div className="flex items-center justify-between">
        <div className={`flex-grow ${position === 'right' && showIcon ? 'text-right' : ''}`}>
          <div className={`text-sm text-text-primary font-medium font-secondary ${compact ? 'line-clamp-1' : ''}`}>
            {prefix}
            <Link 
              to={gamePageUrl}
              className="text-accent-primary hover:underline font-semibold"
            >
              {activity.GameTitle}
            </Link>
            {suffix}
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
