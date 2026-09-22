import { useMemo } from 'react';
import { Activity } from '../types/activity';
import { Game } from '../types/game';

export interface TimelineGraphPoint {
  date: Date;
  hours: number;
  type: string;
  additionalInfo: string;
}

export function useTimelineData(activities: Activity[], game: Game) {
  const extractHours = (additionalInfo: string): number => {
    if (!additionalInfo) return 0;
    const hoursMatch = additionalInfo.match(/(\d+(?:\.\d+)?)\s*ore?/);
    return hoursMatch ? parseFloat(hoursMatch[1]) : 0;
  };

  const getOptimizedGraphData = (): TimelineGraphPoint[] => {
    if (!activities || !game) return [];
    
    const playedActivities = activities
      .filter(activity => 
        activity.timestamp && 
        activity.type === 'Played' && 
        activity.additionalInfo?.includes('ore')
      )
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    
    const totalActivityHours = playedActivities.reduce((sum, activity) => 
      sum + extractHours(activity.additionalInfo || ''), 0
    );
    const initialHours = Math.max(0, (game?.HoursPlayed || 0) - totalActivityHours);
    
    if (playedActivities.length === 0) {
      if (game && game.HoursPlayed > 0) {
        const gameAddedDate = game.PurchaseDate ? new Date(game.PurchaseDate) : new Date();
        return [{
          date: gameAddedDate,
          hours: game.HoursPlayed,
          type: 'Played',
          additionalInfo: `${game.HoursPlayed} ore (inserite manualmente)`
        }];
      }
      return [];
    }
    
    if (playedActivities.length <= 10) {
      let cumulativeHours = initialHours;
      const result: TimelineGraphPoint[] = [];
      
      if (initialHours > 0) {
        const startDate = game?.PurchaseDate ? new Date(game.PurchaseDate) : 
                         new Date(Math.min(...playedActivities.map(a => new Date(a.timestamp).getTime())));
        result.push({
          date: startDate,
          hours: initialHours,
          type: 'Played',
          additionalInfo: `${initialHours} ore iniziali`
        });
      }
      
      playedActivities.forEach(activity => {
        const hoursToAdd = extractHours(activity.additionalInfo || '');
        cumulativeHours += hoursToAdd;
        
        result.push({
          date: new Date(activity.timestamp),
          hours: cumulativeHours,
          type: activity.type,
          additionalInfo: activity.additionalInfo || ''
        });
      });
      
      return result;
    }    

    const firstDate = new Date(playedActivities[0].timestamp);
    const lastDate = new Date(playedActivities[playedActivities.length - 1].timestamp);
    const totalTimeSpan = lastDate.getTime() - firstDate.getTime();
    const timeChunkSize = totalTimeSpan / 9;
    
    const graphPoints: TimelineGraphPoint[] = [];
    let currentChunkEnd = firstDate.getTime() + timeChunkSize;
    let currentChunkHours = 0;
    let totalHours = initialHours;
    
    const startDate = game?.PurchaseDate ? new Date(game.PurchaseDate) : firstDate;
    if (initialHours > 0 && startDate < firstDate) {
      graphPoints.push({
        date: startDate,
        hours: initialHours,
        type: 'Played',
        additionalInfo: `${initialHours} ore iniziali`
      });
    }
    
    graphPoints.push({
      date: firstDate,
      hours: totalHours,
      type: 'Played',
      additionalInfo: initialHours > 0 ? `${totalHours} ore totali` : ''
    });
    
    for (const activity of playedActivities) {
      const activityTime = new Date(activity.timestamp).getTime();
      const hours = extractHours(activity.additionalInfo || '');
      
      if (activityTime > currentChunkEnd) {
        totalHours += currentChunkHours;
        
        graphPoints.push({
          date: new Date(currentChunkEnd),
          hours: totalHours,
          type: 'Played',
          additionalInfo: `${totalHours} ore totali`
        });
        
        currentChunkEnd += timeChunkSize;
        currentChunkHours = 0;
        
        while (activityTime > currentChunkEnd) {
          graphPoints.push({
            date: new Date(currentChunkEnd),
            hours: totalHours,
            type: 'Played',
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
      type: 'Played',
      additionalInfo: `${totalHours} ore totali`
    });
    
    return graphPoints;
  };

  const getKeyEvents = (): Activity[] => {
    if (!activities) return [];
    
    const sortedActivities = [...activities].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    
    const addedEvent = sortedActivities.find(a => a.type === 'Added');
    const completedEvent = sortedActivities.find(a => a.type === 'Completed');
    const platinumEvent = sortedActivities.find(a => a.type === 'Platinum');
    const abandonedEvent = sortedActivities.find(a => a.type === 'Abandoned');
    
    const playedActivities = sortedActivities
      .filter(a => a.type === 'Played' && a.additionalInfo?.includes('ore'))
      .sort((a, b) => {
        const numA = extractHours(a.additionalInfo || '');
        const numB = extractHours(b.additionalInfo || '');
        return numB - numA;
      });
    
    const keyEvents: Activity[] = [];
    
    if (addedEvent) keyEvents.push(addedEvent);
    if (completedEvent) keyEvents.push(completedEvent);
    if (platinumEvent) keyEvents.push(platinumEvent);
    if (abandonedEvent) keyEvents.push(abandonedEvent);
    
    const remainingSlots = 6 - keyEvents.length;
    if (remainingSlots > 0 && playedActivities.length > 0) {
      keyEvents.push(...playedActivities.slice(0, remainingSlots));
    }
    
    return keyEvents.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  };

  const optimizedGraphData = useMemo(() => getOptimizedGraphData(), [activities, game]);
  const keyEvents = useMemo(() => getKeyEvents(), [activities]);

  return {
    optimizedGraphData,
    keyEvents
  };
}
