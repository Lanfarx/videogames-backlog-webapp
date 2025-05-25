import { useState, useEffect, useRef } from "react";
import { Activity } from '../../types/activity';
import { Game } from '../../types/game';
import { formatShortDate } from '../../utils/dateUtils';
import { History } from 'lucide-react';
import ActivityTimelineItem from './ui/ActivityTimelineItem';
import ActivityHistoryPopover from './ui/ActivityHistoryPopover';

interface GameTimelineCardProps {
  activities?: Activity[];
  game: Game;
}

const GameTimelineCard = ({ activities = [], game }: GameTimelineCardProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showHistoryPopover, setShowHistoryPopover] = useState(false);
  
  // Verifichiamo se il gioco ha delle attività
  const hasActivities = activities && activities.length > 0;
  
  // Verifica se il gioco è da iniziare
  const isNotStarted = game.status === "not-started";
  
  // Prepara i dati ottimizzati per il grafico, raggruppando in circa 10 punti
  const getOptimizedGraphData = (activities: Activity[]) => {
    const playedActivities = activities
      .filter(activity => 
        activity.timestamp && 
        activity.type === 'played' && 
        activity.additionalInfo?.includes('ore')
      )
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    
    if (playedActivities.length === 0) return [];
    
    if (playedActivities.length <= 10) {
      let cumulativeHours = 0;
      return playedActivities.map(activity => {
        let hoursToAdd = 0;
        if (activity.additionalInfo) {
          const hoursMatch = activity.additionalInfo.match(/(\d+) ore/);
          if (hoursMatch) {
            hoursToAdd = parseInt(hoursMatch[1], 10);
          }
        }
        cumulativeHours += hoursToAdd;
        
        return {
          date: activity.timestamp,
          hours: cumulativeHours,
          type: activity.type,
          additionalInfo: activity.additionalInfo
        };
      });
    }
    
    const firstDate = playedActivities[0].timestamp;
    const lastDate = playedActivities[playedActivities.length - 1].timestamp;
    const totalTimeSpan = lastDate.getTime() - firstDate.getTime();
    const timeChunkSize = totalTimeSpan / 9;
    
    const graphPoints = [];
    let currentChunkEnd = firstDate.getTime() + timeChunkSize;
    let currentChunkHours = 0;
    let totalHours = 0;
    
    graphPoints.push({
      date: firstDate,
      hours: 0,
      type: 'played',
      additionalInfo: ''
    });
    
    for (const activity of playedActivities) {
      const activityTime = activity.timestamp.getTime();
      
      let hours = 0;
      if (activity.additionalInfo) {
        const hoursMatch = activity.additionalInfo.match(/(\d+) ore/);
        if (hoursMatch) {
          hours = parseInt(hoursMatch[1], 10);
        }
      }
      
      if (activityTime > currentChunkEnd) {
        totalHours += currentChunkHours;
        
        graphPoints.push({
          date: new Date(currentChunkEnd),
          hours: totalHours,
          type: 'played',
          additionalInfo: `${totalHours} ore totali`
        });
        
        currentChunkEnd += timeChunkSize;
        currentChunkHours = 0;
        
        while (activityTime > currentChunkEnd) {
          graphPoints.push({
            date: new Date(currentChunkEnd),
            hours: totalHours,
            type: 'played',
            additionalInfo: `${totalHours} ore totali`
          });
          currentChunkEnd += timeChunkSize;
        }
      }
      
      currentChunkHours += hours;
    }
    
    totalHours += currentChunkHours;
    graphPoints.push({
      date: lastDate,
      hours: totalHours,
      type: 'played',
      additionalInfo: `${totalHours} ore totali`
    });
    
    return graphPoints;
  };
  
  const getKeyEvents = (activities: Activity[]) => {
    const sortedActivities = [...activities].sort((a, b) => 
      a.timestamp.getTime() - b.timestamp.getTime()
    );
    
    const addedEvent = sortedActivities.find(a => a.type === 'added');
    const completedEvent = sortedActivities.find(a => a.type === 'completed');
    const platinumEvent = sortedActivities.find(a => a.type === 'platinum');
    const abandonedEvent = sortedActivities.find(a => a.type === 'abandoned');
    
    const playedActivities = sortedActivities
      .filter(a => a.type === 'played' && a.additionalInfo?.includes('ore'))
      .sort((a, b) => {
        const hoursA = a.additionalInfo?.match(/(\d+) ore/);
        const hoursB = b.additionalInfo?.match(/(\d+) ore/);
        const numA = hoursA ? parseInt(hoursA[1], 10) : 0;
        const numB = hoursB ? parseInt(hoursB[1], 10) : 0;
        return numB - numA;
      });
    
    const keyEvents = [];
    
    if (addedEvent) keyEvents.push(addedEvent);
    if (completedEvent) keyEvents.push(completedEvent);
    if (platinumEvent) keyEvents.push(platinumEvent);
    if (abandonedEvent) keyEvents.push(abandonedEvent);
    
    const remainingSlots = 6 - keyEvents.length;
    if (remainingSlots > 0 && playedActivities.length > 0) {
      keyEvents.push(...playedActivities.slice(0, remainingSlots));
    }
    
    return keyEvents.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  };
  
  const getAccentPrimaryColor = () => {
    const style = getComputedStyle(document.documentElement);
    const accentPrimary = style.getPropertyValue('--accent-primary').trim();
    return `rgb(${accentPrimary})`;
  };

  useEffect(() => {
    if (!canvasRef.current) return;
    
    const isEmptyGraph = isNotStarted || !hasActivities;
    
    const gamePlayActivities = activities.filter(activity => 
      activity.timestamp && 
      activity.type === 'played' && 
      activity.additionalInfo?.includes('ore')
    );
    
    const graphData = !isEmptyGraph ? getOptimizedGraphData(activities) : [];
    
    if (graphData.length === 0 && !isEmptyGraph) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const margin = { top: 10, right: 20, bottom: 30, left: 30 };
    const width = rect.width - margin.left - margin.right;
    const height = rect.height - margin.top - margin.bottom;

    let maxHoursFromData = 0;
    if (graphData.length > 0) {
      maxHoursFromData = Math.max(...graphData.map(point => point.hours));
    }
    
    const currentHours = game.hoursPlayed;
    const maxHours = Math.max(currentHours, maxHoursFromData, 10);

    const getHourScale = (max: number) => {
      if (max <= 10) return [0, 2, 4, 6, 8, 10];
      if (max <= 20) return [0, 5, 10, 15, 20];
      if (max <= 40) return [0, 10, 20, 30, 40];
      if (max <= 60) return [0, 15, 30, 45, 60];
      if (max <= 100) return [0, 25, 50, 75, 100];
      const step = Math.ceil(max / 4 / 5) * 5;
      return [0, step, 2 * step, 3 * step, 4 * step];
    };
    
    const hourValues = getHourScale(maxHours);
    const actualMaxHours = hourValues[hourValues.length - 1];
    
    hourValues.forEach((hours, i) => {
      const y = margin.top + height - (i * (height / (hourValues.length - 1)));
      
      ctx.strokeStyle = "rgba(var(--border-color), 0.05)";
      ctx.lineWidth = 0.5;
      
      ctx.beginPath();
      ctx.moveTo(margin.left, y);
      ctx.lineTo(width + margin.left, y);
      ctx.stroke();

      if (hours > 0) {
        ctx.fillStyle = "rgb(var(--text-secondary))";
        ctx.font = "11px var(--font-secondary)";
        ctx.textAlign = "right";
        ctx.fillText(`${hours}h`, margin.left - 5, y + 3);
      }
    });
    
    const axisColor = "rgba(var(--border-color), 0.3)";
    
    ctx.strokeStyle = axisColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(margin.left, margin.top);
    ctx.lineTo(margin.left, margin.top + height);
    ctx.stroke();
    
    ctx.strokeStyle = axisColor;
    ctx.beginPath();
    ctx.moveTo(margin.left, margin.top + height);
    ctx.lineTo(margin.left + width, margin.top + height);
    ctx.stroke();
    
    if (!isEmptyGraph && graphData.length > 0) {
      ctx.strokeStyle = getAccentPrimaryColor();
      ctx.lineWidth = 1.5;
      ctx.beginPath();

      const xScale = width / (graphData.length - 1);

      graphData.forEach((point, i) => {
        const x = margin.left + i * xScale;
        const y = margin.top + height - (point.hours / actualMaxHours * height);

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();

      graphData.forEach((point, i) => {
        const x = margin.left + i * xScale;
        const y = height + margin.top + 15;
        
        const previousPoint = i > 0 ? graphData[i-1] : undefined;
        const previousDate = previousPoint ? previousPoint.date : undefined;
        const isLastPoint = i === graphData.length - 1;
        
        ctx.fillStyle = "rgb(var(--text-secondary))";
        ctx.font = "11px var(--font-secondary)";
        ctx.textAlign = "center";
        
        const formattedDate = formatShortDate(point.date, previousDate, isLastPoint);
        
        if (formattedDate.includes('\n')) {
          const [datePart, yearPart] = formattedDate.split('\n');
          
          ctx.fillText(datePart, x, y);
          ctx.fillText(yearPart, x, y + 15);
        } else {
          ctx.fillText(formattedDate, x, y);
        }
      });

      graphData.forEach((point, i) => {
        const x = margin.left + i * xScale;
        const y = margin.top + height - (point.hours / actualMaxHours * height);

        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI); 
        ctx.fillStyle = getAccentPrimaryColor();
        ctx.fill();
      });
    }
  }, [hasActivities, activities, game.hoursPlayed, game.purchaseDate, isNotStarted]);
  
  const keyEvents = hasActivities ? getKeyEvents(activities) : [];
  
  return (
    <div className="bg-primaryBg border border-border-color rounded-xl p-6">
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
          <canvas ref={canvasRef} className="w-full h-full"></canvas>
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
                    key={i}
                    activity={activity}
                    previousActivity={prevActivity}
                    isLastActivity={isLastEvent}
                  />
                );
              })}
            </div>
          </div>
        )}
        
        {!hasActivities && !isNotStarted && (
          <p className="font-secondary text-sm text-text-secondary">
            Nessuna attività registrata per questo gioco.
          </p>
        )}
      </div>
      
      {showHistoryPopover && (
        <ActivityHistoryPopover 
          activities={activities}
          onClose={() => setShowHistoryPopover(false)}
          gameTitle={game.title}
        />
      )}
    </div>
  );
};

export default GameTimelineCard;
