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
  const gameTitle = activity.gameTitle;
  
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
}) => {  // Recupera i dati dell'attività
  const formattedTime = formatRelativeTime(activity.timestamp);
  const icon = showIcon ? getActivityIcon(activity.type) : null;
  const { prefix, suffix } = parseActivityText(activity);
  
  // Genera il link alla pagina del gioco
  const gamePageUrl = `/library/${encodeURIComponent(activity.gameTitle.replace(/ /g, '_'))}`;    return (
    <div className={`group relative bg-gradient-to-br from-primary-bg via-secondary-bg to-primary-bg border border-border-color/50 rounded-xl shadow-sm hover:shadow-xl overflow-hidden ${compact ? 'p-3' : 'p-4'} ${className}`}>{/* Effetto shimmer animato */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent-primary/5 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
      
      <div className="relative flex items-center justify-between">
        <div className={`flex-grow ${position === 'right' && showIcon ? 'text-right' : ''}`}>
          <div className={`text-sm text-text-primary font-medium font-secondary transition-colors duration-300 group-hover:text-accent-primary ${compact ? 'line-clamp-1' : ''}`}>
            {prefix}            <Link 
              to={gamePageUrl}
              className="text-accent-primary hover:text-accent-secondary font-semibold transition-colors duration-300 inline-block relative"
            >
              <span className="relative z-10">{activity.gameTitle}</span>
            </Link>
            {suffix}
          </div>
          <div className="text-xs text-text-secondary mt-1 transition-colors duration-300 group-hover:text-text-primary font-medium">
            {formattedTime}
          </div>
        </div>
        
        {showIcon && (
          <div className={`flex-shrink-0 ${position === 'right' ? 'mr-4 order-first' : 'ml-4'}`}>
            <div className="transition-colors duration-300 text-accent-primary group-hover:text-accent-secondary">
              {icon}
            </div>
          </div>
        )}
      </div>
      
      {/* Indicatore di attività animato */}
      <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-accent-primary via-accent-secondary to-accent-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left rounded-full"></div>
    </div>
  );
};

export default ActivityCard;
