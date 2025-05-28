import { Activity } from '../types/activity';

export function getNextActivityIdFromList(activities: Activity[]): number {
  if (!activities.length) return 1;
  const maxId = activities.reduce((max, a) => {
    const idNum = typeof a.id === 'number' ? a.id : parseInt(String(a.id), 10);
    return idNum > max ? idNum : max;
  }, 0);
  return maxId + 1;
}
