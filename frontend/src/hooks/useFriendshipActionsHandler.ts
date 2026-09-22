import { useCallback } from 'react';
import { useFriendshipActions } from '../store/hooks/friendshipHooks';
import { useFriendsNavigation } from './navigationHooks';
import { UserProfile } from '../types/friendship';

export function useFriendshipActionsHandler(
  profile: UserProfile | null, 
  userName: string | undefined,
  reloadProfile: (identifier: string | number) => void
) {
  const { navigateToFriends } = useFriendsNavigation();
  const { 
    sendFriendRequest, 
    acceptFriendRequest, 
    rejectFriendRequest, 
    removeFriend, 
    blockUser
  } = useFriendshipActions();

  const handleAction = useCallback(async (action: string) => {
    if (!profile) return;
    
    try {
      switch (action) {
        case 'sendRequest':
          sendFriendRequest(profile.userName);
          break;
        case 'accept':
          if (profile.friendshipId) {
            acceptFriendRequest(profile.friendshipId);
            navigateToFriends();
            return;
          }
          break;
        case 'reject':
          if (profile.friendshipId) {
            rejectFriendRequest(profile.friendshipId);
          }
          break;
        case 'remove':
          if (window.confirm(`Sei sicuro di voler rimuovere ${profile.userName} dagli amici?`)) {
            removeFriend(profile.userId);
          }
          break;
        case 'block':
          if (profile.friendshipStatus === 'Blocked') {
            if (window.confirm(`Vuoi sbloccare ${profile.userName}?`)) {
              blockUser(profile.userId);
            }
          } else {
            if (window.confirm(`Sei sicuro di voler bloccare ${profile.userName}?`)) {
              blockUser(profile.userId);
            }
          }
          break;
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (userName) {
        if (/^\d+$/.test(userName)) {
          reloadProfile(parseInt(userName, 10));
        } else {
          reloadProfile(userName);
        }
      }
    } catch (error) {
      console.error('Errore durante l\'azione:', error);
    }
  }, [profile, userName, sendFriendRequest, acceptFriendRequest, rejectFriendRequest, removeFriend, blockUser, navigateToFriends, reloadProfile]);

  return handleAction;
}
