import { Game } from '../../../types/game';
import { Activity, ActivityWithReactions } from '../../../types/activity';
import { isFirstActivityInMonth } from '../../../utils/activityUtils';

export interface PublicProfileContext {
  canViewDiary: boolean;
  isFriend: boolean;
  isOwnProfile: boolean;
}

export function shouldShowReview(
  game: Game | null | undefined,
  fetchedGame: Game | null | undefined,
  publicProfile?: PublicProfileContext
): boolean {
  if (!game?.Review) {
    return false;
  }
  
  if (!publicProfile || publicProfile.isOwnProfile) {
    return true;
  }
  
  if (fetchedGame && fetchedGame.Review) {
    return true;
  }
  
  const isReviewPublic = game.Review.IsPublic ?? false;
  if (!isReviewPublic) {
    return false;
  }
  
  const isPrivateProfile = !publicProfile.canViewDiary;
  const isFriend = publicProfile.isFriend;
  
  if (isPrivateProfile && !isFriend) {
    return false;
  }
  
  const isDiaryPrivate = !publicProfile.canViewDiary;
  if (isDiaryPrivate && !isFriend) {
    return false;
  }
  
  return true;
}

export function getDiaryEntryLabel(activity: Activity | ActivityWithReactions, allActivities: Activity[]): string {
  switch (activity.type) {
    case 'Played': {
      const isFirstInMonth = isFirstActivityInMonth(activity, allActivities, 'Played');
      return isFirstInMonth ? 'Prima sessione del mese' : 'Giocato';
    }
    case 'Platinum':
      return 'Platinato';
    case 'Rated':
      return 'Recensito';     
    case 'Abandoned':
      return 'Abbandonato';
    case 'Completed':
      return 'Completato';
    case 'Added':
      return 'Aggiunto';
    default:
      return '';
  }
}
